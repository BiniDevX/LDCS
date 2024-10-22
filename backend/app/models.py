import json
from sqlalchemy import Column, Date, Integer, String, Boolean, Float, ForeignKey, DateTime, Text, Enum
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from typing import Optional, Dict


class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    display_name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=True)
    is_admin = Column(Boolean, default=False)
    profile_picture = Column(String, nullable=True)  
    bio = Column(Text, nullable=True)  
    contact_number = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    patients = relationship('Patient', back_populates='user', cascade="all, delete-orphan")
    tests = relationship('Test', back_populates='user', cascade="all, delete-orphan")
    activities = relationship('UserActivity', back_populates='user', cascade="all, delete-orphan")

    def set_password(self, password: str) -> None:
        """Generate and set the password hash."""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        """Check if the provided password matches the stored hash."""
        return check_password_hash(self.password_hash, password)

    def to_dict(self) -> Dict[str, Optional[str]]:
        """Return a dictionary representation of the user, excluding sensitive fields."""
        return {
            'id': self.id,
            'username': self.username,
            'display_name': self.display_name,
            'email': self.email,
            'profile_picture': self.profile_picture,
            'bio': self.bio,
            'contact_number': self.contact_number,
            'is_admin': self.is_admin,
            'is_active': self.is_active,
            'created_at': self.created_at,
            'updated_at': self.updated_at,
        }


class Patient(Base):
    __tablename__ = 'patients'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    name = Column(String, nullable=False)
    date_of_birth = Column(Date, nullable=False)
    gender = Column(Enum('Male', 'Female', 'Other', name='gender_enum'), nullable=False)
    address = Column(String)
    phone = Column(String, unique=True, nullable=False)
    emergency_contact = Column(String, nullable=True)
    insurance_details = Column(Text, nullable=True)
    blood_type = Column(Enum('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', name='blood_type_enum'))
    allergies = Column(Text, nullable=True)
    medical_history = relationship('MedicalHistory', back_populates='patient', cascade="all, delete-orphan")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user = relationship('User', back_populates='patients')
    tests = relationship('Test', back_populates='patient', cascade="all, delete-orphan")

    def to_dict(self) -> Dict[str, Optional[str]]:
        """Return a dictionary representation of the patient."""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'date_of_birth': self.date_of_birth,
            'gender': self.gender,
            'address': self.address,
            'phone': self.phone,
            'emergency_contact': self.emergency_contact,
            'insurance_details': self.insurance_details,
            'blood_type': self.blood_type,
            'allergies': self.allergies,
            'notes': self.notes,
            'created_at': self.created_at,
            'updated_at': self.updated_at,
        }


class MedicalHistory(Base):
    __tablename__ = 'medical_histories'

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey('patients.id'), nullable=False)
    condition = Column(String, nullable=False)  
    description = Column(Text, nullable=True) 
    date_diagnosed = Column(Date, nullable=True)
    medications = Column(Text, nullable=True)  
    patient = relationship('Patient', back_populates='medical_history')

    def to_dict(self) -> Dict[str, Optional[str]]:
        """Return a dictionary representation of the medical history record."""
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'condition': self.condition,
            'description': self.description,
            'date_diagnosed': self.date_diagnosed,
            'medications': self.medications,
        }


class Test(Base):
    __tablename__ = 'tests'

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey('patients.id'), nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    date_conducted = Column(DateTime, default=datetime.utcnow)
    result = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)
    image_path = Column(String, nullable=False)
    report_path = Column(String, nullable=True)
    predictions = Column(Text, nullable=True)  # New column for storing all predictions as JSON
    comments = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    patient = relationship('Patient', back_populates='tests')
    user = relationship('User', back_populates='tests')

    def to_dict(self):
        try:
            predictions = json.loads(self.predictions) if self.predictions else None
        except (json.JSONDecodeError, TypeError):
            predictions = None
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'user_id': self.user_id,
            'date_conducted': self.date_conducted.strftime('%Y-%m-%d %H:%M:%S'),
            'result': self.result,
            'confidence': self.confidence,
            'image_path': self.image_path,
            'report_path': self.report_path,
            'predictions': predictions,
            'comments': self.comments,
            'created_at': self.created_at,
            'updated_at': self.updated_at,
        }



class UserActivity(Base):
    __tablename__ = 'user_activities'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    activity = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    details = Column(Text, nullable=True)  # e.g., "Logged in", "Viewed patient records"
    user = relationship('User', back_populates='activities')

    def to_dict(self) -> Dict[str, Optional[str]]:
        """Return a dictionary representation of the user activity."""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'activity': self.activity,
            'timestamp': self.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
            'details': self.details,
        }
