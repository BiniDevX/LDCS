from datetime import datetime
import json
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from fastapi_jwt_auth import AuthJWT
from pydantic import BaseModel, Field
from passlib.context import CryptContext
from typing import Optional
import os
from backend.app.models import User, Patient, Test
from backend.app.helpers import hash_password, preprocess_image, allowed_file, generate_pdf_report, verify_password,make_prediction, visualize_prediction
from backend.app.extensions import AuthJWT, get_db
from fastapi.responses import StreamingResponse, JSONResponse
import logging
import uuid

# Define the router for the API
router = APIRouter()

# Setup logging
logger = logging.getLogger("app")

# Password hashing context using bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ----------------------
# User Authentication
# ----------------------

# Retrieve the current logged-in user
@router.get("/api/users/me", status_code=status.HTTP_200_OK)
def get_current_user(db: Session = Depends(get_db), Authorize: AuthJWT = Depends()):
    """
    Fetch the currently authenticated user based on the JWT token.
    """
    Authorize.jwt_required()
    current_user = Authorize.get_jwt_subject()  # Get username from token
    user = db.query(User).filter(User.username == current_user).first()

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    return user.to_dict()  # Return user info as a dictionary

# Upload user profile picture
@router.post("/api/users/me/profile-picture", status_code=status.HTTP_200_OK)
def upload_profile_picture(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    Authorize: AuthJWT = Depends()
):
    """
    Allows authenticated users to upload a profile picture.
    """
    Authorize.jwt_required()
    current_user = Authorize.get_jwt_subject()
    user = db.query(User).filter(User.username == current_user).first()

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Validate the uploaded file type (e.g., jpg or png)
    if not allowed_file(file.filename):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid file type")

    # Save the file in a dedicated profile picture directory
    upload_folder = './uploads/profile_pictures'
    os.makedirs(upload_folder, exist_ok=True)
    unique_filename = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(upload_folder, unique_filename)

    with open(file_path, 'wb') as buffer:
        buffer.write(file.file.read())

    # Update the user's profile picture path in the database
    user.profile_picture = f"/uploads/profile_pictures/{unique_filename}"
    db.commit()

    return {"message": "Profile picture updated successfully.", "profile_picture": user.profile_picture}

# Model to update user profile information
class UpdateUserProfileModel(BaseModel):
    display_name: Optional[str]
    email: Optional[str]
    bio: Optional[str]
    contact_number: Optional[str]
    profile_picture: Optional[str]  # URL or path to the uploaded image

# Update the currently logged-in user's profile
@router.put("/api/users/me", status_code=status.HTTP_200_OK)
def update_current_user(
    user_data: UpdateUserProfileModel,
    db: Session = Depends(get_db),
    Authorize: AuthJWT = Depends()
):
    """
    Update the profile information of the current user.
    """
    Authorize.jwt_required()
    current_user = Authorize.get_jwt_subject()
    user = db.query(User).filter(User.username == current_user).first()

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Update provided fields
    if user_data.display_name:
        user.display_name = user_data.display_name
    if user_data.email:
        user.email = user_data.email
    if user_data.bio:
        user.bio = user_data.bio
    if user_data.contact_number:
        user.contact_number = user_data.contact_number
    if user_data.profile_picture:
        user.profile_picture = user_data.profile_picture

    db.commit()
    db.refresh(user)

    return {"message": "Profile updated successfully.", "user": user.to_dict()}

# Model for creating a new user
class CreateUser(BaseModel):
    username: str
    password: str
    display_name: str
    is_admin: bool = False

# Create a new user account (Admin only)
@router.post("/api/users", status_code=status.HTTP_201_CREATED)
def create_user(user: CreateUser, db: Session = Depends(get_db), Authorize: AuthJWT = Depends()):
    """
    Allows admin users to create new user accounts.
    """
    Authorize.jwt_required()
    current_user = Authorize.get_jwt_subject()
    db_user = db.query(User).filter(User.username == current_user).first()

    # Only admins can create new users
    if not db_user or not db_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")

    existing_user = db.query(User).filter(User.username == user.username).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already taken")

    # Hash the password and create the new user
    hashed_password = hash_password(user.password)
    new_user = User(username=user.username, password_hash=hashed_password, display_name=user.display_name, is_admin=user.is_admin)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User created successfully", "user_id": new_user.id}

# Model for user login
class LoginModel(BaseModel):
    username: str
    password: str

# User login and token generation
@router.post("/api/login")
def login(login_data: LoginModel, db: Session = Depends(get_db), Authorize: AuthJWT = Depends()):
    """
    Logs in a user and returns an access token.
    """
    user = db.query(User).filter(User.username == login_data.username).first()
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    # Generate access token
    access_token = Authorize.create_access_token(subject=user.username)
    return {"access_token": access_token, "is_admin": user.is_admin}

# ----------------------
# Patient Management
# ----------------------

# Model to register a new patient
class RegisterPatientModel(BaseModel):
    name: str
    dateOfBirth: str = Field(regex=r"^\d{4}-\d{2}-\d{2}$")  # Validate date format as YYYY-MM-DD
    gender: str
    phone: Optional[str] = Field(regex=r"^\+?[1-9]\d{1,14}$", example="+1234567890")
    address: Optional[str] = None

# Register a new patient
@router.post("/api/patients", status_code=status.HTTP_201_CREATED)
def register_patient(patient_data: RegisterPatientModel, db: Session = Depends(get_db), Authorize: AuthJWT = Depends()):
    """
    Allows authenticated users to register a new patient.
    """
    Authorize.jwt_required()
    current_user = Authorize.get_jwt_subject()
    user = db.query(User).filter(User.username == current_user).first()

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Ensure the phone number is not already registered
    existing_patient = db.query(Patient).filter(Patient.phone == patient_data.phone).first()
    if existing_patient:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Phone number already registered")

    # Validate and create the new patient entry
    try:
        date_of_birth = datetime.strptime(patient_data.dateOfBirth, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid date format. Use YYYY-MM-DD.")

    new_patient = Patient(
        user_id=user.id,
        name=patient_data.name,
        date_of_birth=date_of_birth,
        gender=patient_data.gender.capitalize(),
        phone=patient_data.phone,
        address=patient_data.address
    )

    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)

    return {"message": "Patient created successfully", "patient_id": new_patient.id}

# Get a list of patients for the current user
@router.get('/api/patients', status_code=status.HTTP_200_OK)
def get_patients(
    limit: int = 10,
    offset: int = 0,
    db: Session = Depends(get_db),
    Authorize: AuthJWT = Depends()
):
    """
    Retrieves a paginated list of patients for the current user.
    """
    # Ensure valid JWT is provided
    Authorize.jwt_required()
    current_user = Authorize.get_jwt_subject()

    # Get the current user
    user = db.query(User).filter(User.username == current_user).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Get total patient count for pagination
    total_count = db.query(Patient).filter(Patient.user_id == user.id).count()

    # Fetch patients with pagination
    patients = (
        db.query(Patient)
        .filter(Patient.user_id == user.id)
        .offset(offset)
        .limit(limit)
        .all()
    )

    # Return patients as a list with the total count for pagination
    return {"patients": [patient.to_dict() for patient in patients], "total_count": total_count}

# Get a single patient's details by ID
@router.get("/api/patients/{patient_id}", status_code=status.HTTP_200_OK)
def get_patient(patient_id: int, db: Session = Depends(get_db), Authorize: AuthJWT = Depends()):
    """
    Fetch details of a specific patient by ID.
    """
    Authorize.jwt_required()
    current_user = Authorize.get_jwt_subject()
    user = db.query(User).filter(User.username == current_user).first()

    # Find the patient and ensure the user is authorized to view the patient
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient or (not user.is_admin and patient.user_id != user.id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    return patient.to_dict()

# Update a patient's details by ID
@router.put("/api/patients/{patient_id}", status_code=status.HTTP_200_OK)
def update_patient(patient_id: int, updated_data: RegisterPatientModel, db: Session = Depends(get_db), Authorize: AuthJWT = Depends()):
    """
    Update the details of a specific patient by ID.
    """
    Authorize.jwt_required()
    current_user = Authorize.get_jwt_subject()
    user = db.query(User).filter(User.username == current_user).first()

    # Find the patient and ensure authorization
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient or (not user.is_admin and patient.user_id != user.id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    # Update fields that were provided
    for key, value in updated_data.dict(exclude_unset=True).items():
        setattr(patient, key, value)

    db.commit()

    return {"message": "Patient updated successfully", "patient_id": patient_id}

# Delete a patient by ID
@router.delete("/api/patients/{patient_id}", status_code=status.HTTP_200_OK)
def delete_patient(patient_id: int, db: Session = Depends(get_db), Authorize: AuthJWT = Depends()):
    """
    Delete a specific patient by ID.
    """
    Authorize.jwt_required()
    current_user = Authorize.get_jwt_subject()
    user = db.query(User).filter(User.username == current_user).first()

    # Find the patient and ensure authorization
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient or (not user.is_admin and patient.user_id != user.id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    # Delete the patient
    db.delete(patient)
    db.commit()

    return {"message": "Patient deleted successfully"}

# ----------------------
# Test Management
# ----------------------

# Get all tests for a specific patient
@router.get("/api/tests/patient/{patient_id}", status_code=status.HTTP_200_OK)
def get_tests_for_patient(patient_id: int, db: Session = Depends(get_db), Authorize: AuthJWT = Depends()):
    """
    Fetch all tests for a specific patient.
    """
    Authorize.jwt_required()
    current_user = Authorize.get_jwt_subject()
    user = db.query(User).filter(User.username == current_user).first()

    patient = db.query(Patient).filter(Patient.id == patient_id, Patient.user_id == user.id).first()

    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    # Get all tests for the patient
    tests = db.query(Test).filter(Test.patient_id == patient_id).all()
    return [test.to_dict() for test in tests]

# Get a specific test by its ID
@router.get("/api/tests/{test_id}", status_code=status.HTTP_200_OK)
def get_test(test_id: int, db: Session = Depends(get_db), Authorize: AuthJWT = Depends()):
    """
    Fetch a specific test result by its ID.
    """
    Authorize.jwt_required()
    current_user = Authorize.get_jwt_subject()
    user = db.query(User).filter(User.username == current_user).first()

    # Find the test
    test = db.query(Test).filter(Test.id == test_id).first()

    if not test or (not user.is_admin and test.user_id != user.id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Test not found")

    return test.to_dict()

# ----------------------------------------
# Create New Test Endpoint
# ----------------------------------------

import json

@router.post("/api/tests", status_code=201)
def new_test(
    patientId: int = Form(...),
    image: UploadFile = File(...),
    Authorize: AuthJWT = Depends(),
    db: Session = Depends(get_db)
) -> dict:
    # Ensure user is authenticated
    Authorize.jwt_required()
    current_user = Authorize.get_jwt_subject()
    user = db.query(User).filter(User.username == current_user).first()

    # Fetch patient record
    patient = db.query(Patient).filter(Patient.id == patientId, Patient.user_id == user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Validate the file type
    if not allowed_file(image.filename):
        raise HTTPException(status_code=400, detail="Invalid file type")

    # Save the uploaded image
    upload_folder = './uploads'
    os.makedirs(upload_folder, exist_ok=True)
    image_path = os.path.join(upload_folder, f"{uuid.uuid4()}_{image.filename}")

    with open(image_path, 'wb') as buffer:
        for chunk in image.file:
            buffer.write(chunk)

    # Preprocess image for the model
    try:
        processed_image = preprocess_image(image_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image preprocessing failed: {str(e)}")

    # Make prediction for all classes
    try:
        predictions = make_prediction(processed_image)
        predictions = [(cls, float(conf)) for cls, conf in predictions]
    except Exception as e:
        raise HTTPException(status_code=500, detail="Model prediction failed.")

    # Serialize predictions to JSON string
    serialized_predictions = json.dumps(predictions)

    # Store the new test in the database
    top_prediction = max(predictions, key=lambda x: x[1])  # Get the prediction with the highest confidence
    new_test = Test(
        patient_id=patient.id,
        user_id=user.id,
        image_path=image_path,
        result=top_prediction[0],  # Set result to the class with highest confidence
        confidence=top_prediction[1],  # Confidence as a Python float
        predictions=serialized_predictions,  # Store the serialized predictions
        date_conducted=datetime.utcnow()
    )
    db.add(new_test)
    db.commit()

    return {
        "message": "Test created successfully",
        "patient_id": patient.id,
        "test_id": new_test.id,
        "result": top_prediction[0],
        "confidence": top_prediction[1],
        "all_predictions": predictions
    }


# ----------------------------------------
# Download Test Report Endpoint
# ----------------------------------------

@router.get("/api/report/download/{test_id}", response_class=StreamingResponse)
def download_report(test_id: int, db: Session = Depends(get_db), Authorize: AuthJWT = Depends()):
    # Ensure the user is authenticated
    Authorize.jwt_required()
    current_user = Authorize.get_jwt_subject()

    # Fetch the user from the database
    user = db.query(User).filter(User.username == current_user).first()
    if not user:
        raise HTTPException(status_code=403, detail="User not found")

    # Fetch the test record
    test = db.query(Test).filter(Test.id == test_id).first()
    if not test or (not user.is_admin and test.user_id != user.id):
        raise HTTPException(status_code=404, detail="Test not found or access denied")

    # Check if the image file exists
    if not os.path.exists(test.image_path):
        raise HTTPException(status_code=404, detail="Image file not found")

    try:
        # Retrieve all predictions from the database (stored in a string)
        predictions = eval(test.predictions)  # Convert the string back to list of tuples

        # Generate prediction visualization for all classes
        prediction_image = visualize_prediction(test.image_path, predictions)

        # Generate PDF report with the visualization
        pdf_buffer = generate_pdf_report(test, prediction_image)
        pdf_buffer.seek(0)

        # Return the PDF as a downloadable file
        headers = {"Content-Disposition": f"attachment; filename=report_{test_id}.pdf"}
        return StreamingResponse(pdf_buffer, media_type='application/pdf', headers=headers)

    except Exception as e:
        logger.error(f"Failed to generate report for test ID {test_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate the report")