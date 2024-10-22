# LDCS Backend (Lung Disease Classification System)

This repository contains the backend for the Lung Disease Classification System (LDCS), implemented using **FastAPI**. It manages API requests, handles AI-based image classification, manages user authentication, and stores patient data in a SQLite database.

## Features

- User authentication with JWT-based authorization.
- Patient management: Add, update, delete, and view patient data.
- Upload diagnostic X-rays for AI-based lung disease classification.
- Store test results with confidence scores and disease classification.
- Download test results as PDF reports.
- Role-based access control (RBAC) for admin and standard users.

## System Requirements

- **Python 3.8+**
- **Virtual Environment** (optional but recommended)
- **SQLite** (Default DB for development; can switch to PostgreSQL or MySQL)

## Installation and Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/BiniDevX/LDCS.git
cd LDCS/backend
```

### Step 2: Create and Activate a Virtual Environment

Using `venv`:

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
```

### Step 3: Install Dependencies

After activating the virtual environment, install the required packages using:

```bash
pip install -r requirements.txt
```

### Step 4: Create Environment Variables

Create a `.env` file in the backend directory with the following content:

```plaintext
SECRET_KEY=your_secret_key
JWT_SECRET_KEY=your_jwt_secret_key
```

Replace `your_secret_key` and `your_jwt_secret_key` with your custom secure keys.

### Step 5: Apply Database Migrations

Use Alembic (or any preferred ORM migration tool) to apply migrations.

```bash
alembic upgrade head
```

### Step 6: Create Admin User

Run the following Python script to create the first admin user for logging into the system:

```bash
python create_admin_user.py
```

The default username and password will be set as:

```plaintext
admin_username = "admin"
admin_password = "@Adminpassword123"
```

After running the script, you will have an admin account created.

### Step 7: Run the Application

To run the FastAPI server, execute:

```bash
uvicorn main:app --reload
```

This will start the backend server at `http://127.0.0.1:8000`.

### Step 8: Access API Documentation

FastAPI automatically generates interactive API documentation using Swagger. You can access it by navigating to:

```plaintext
http://127.0.0.1:8000/docs
```

For an alternative documentation view using Redoc:

```plaintext
http://127.0.0.1:8000/redoc
```

## API Endpoints Overview

### User Authentication

#### POST /api/login

Authenticate a user and return a JWT token.

#### GET /api/users/me

Get details of the currently logged-in user.

### Patient Management

#### POST /api/patients

Register a new patient with details such as name, DOB, gender, etc.

#### GET /api/patients

Retrieve a paginated list of all patients.

#### GET /api/patients/{patient_id}

Retrieve details of a specific patient by ID.

#### PUT /api/patients/{patient_id}

Update a specific patient's details.

#### DELETE /api/patients/{patient_id}

Delete a specific patient's record.

### Test Management

#### POST /api/tests

Upload an X-ray image for lung disease classification. The AI model will process the image and return a prediction.

#### GET /api/tests/patient/{patient_id}

Retrieve all tests conducted for a specific patient.

#### GET /api/tests/{test_id}

Retrieve details of a specific test by ID.

#### GET /api/report/download/{test_id}

Download a PDF report of a specific test, including the diagnostic image and classification results.

## AI Model Details

The AI model used for lung disease classification is based on **EfficientNetB0** with the **CBAM (Convolutional Block Attention Module)** for improved accuracy. The model is trained on a dataset of X-ray images of lungs, classifying them into categories such as:

- Normal
- Pneumonia
- COVID-19
- Tuberculosis

### Model Loading and Prediction

The backend includes helper functions to load the trained model and make predictions using the uploaded X-ray images. The images are preprocessed using TensorFlow/Keras utilities before inference.

```python
def make_prediction(processed_image):
    prediction = model.predict(processed_image)
    return [(class_indices[i], prediction[0][i]) for i in range(len(class_indices))]
```

### CBAM Integration

The CBAM block helps improve the feature extraction by adding both **channel** and **spatial attention** to the EfficientNet base model. The code for the CBAM block is included in `helpers.py`.

## PDF Report Generation

Test results can be downloaded in the form of a PDF report. This is handled using the `ReportLab` library.

- **Report contents:**
  - Patient Information
  - X-ray Image
  - AI model classification result
  - Confidence scores for all predicted classes

A PDF is generated using the following utility:

```python
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Image

def generate_pdf_report(test, prediction_image):
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    # Add patient details, predictions, and image to the PDF
    doc.build(story)
    buffer.seek(0)
    return buffer
```

## Database

The system uses **SQLite** as the default database for development purposes. However, it can be easily scaled to use **PostgreSQL** or **MySQL** for production.

### Database Models

The key models are:

- **User**: Manages user authentication and profile.
- **Patient**: Stores patient details.
- **Test**: Stores test details, including image path, result, and confidence score.

### Migrations

To handle database migrations, **Alembic** is used. The migration commands are provided in the `migrations/` folder.

## Security

- **JWT Authentication**: Users must log in to access the protected endpoints, and JWT tokens are used to authenticate API requests.
- **Role-Based Access Control (RBAC)**: Different roles (admin, standard users) have varying access levels to the API.
- **Input Validation**: All inputs are validated to prevent SQL injection and other attacks.

## Testing

Testing is handled using **Pytest**. Test cases for each of the main API endpoints are provided in the `tests/` directory.

Run tests with:

```bash
pytest
```

## Future Enhancements

- Integration with a more scalable database such as **PostgreSQL**.
- Model versioning to allow updating and switching between AI models seamlessly.
- Add background tasks for batch processing of X-ray images.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
