# Lung Disease Classification System (LDCS)

## Abstract

The Lung Disease Classification System (LDCS) is a web-based application that integrates a deep learning model to assist medical professionals in diagnosing lung diseases from X-ray images. The system includes features for patient data management, image uploads for diagnostic analysis, and report generation. The application consists of a **React.js** frontend and a **FastAPI** backend, with an integrated AI model for real-time image analysis.

## Table of Contents

1. [Abstract](#abstract)
2. [System Architecture](#system-architecture)
3. [Features](#features)
4. [Tech Stack](#tech-stack)
5. [Installation](#installation)
   - [Backend Installation](#backend-installation)
   - [Frontend Installation](#frontend-installation)
6. [API Documentation](#api-documentation)
7. [License](#license)

---

## System Architecture

The architecture consists of three main layers:

- **Frontend (React.js)**: Provides a responsive user interface for managing patients, uploading X-rays, and viewing diagnostic results.
- **Backend (FastAPI)**: Manages API requests, authenticates users, processes AI model inferences, and interacts with the database.
- **Database (SQLite)**: Stores user information, patient records, diagnostic test data, and AI results.

---

## Features

### User Authentication

- **Login/Logout**: Secure authentication with JWT.
- **Profile Management**: Users can update their profile details and upload profile pictures.

### Patient Management

- **Add/Update/Delete Patient**: Admin users can add, modify, or remove patient records.
- **View Patients**: View a list of all patients, along with detailed information on each patient.

### Diagnostic Test Management

- **Upload X-rays**: Upload medical images (X-rays) for AI-based diagnostic analysis.
- **View Test Results**: Display diagnostic results, including predicted disease and confidence scores.
- **Download Reports**: Generate and download PDF reports containing patient data, X-ray results, and AI analysis.

### AI-Based Diagnosis

- **X-ray Analysis**: The AI model processes X-ray images and returns predictions (e.g., Pneumonia, Tuberculosis).
- **Confidence Scores**: The system provides confidence levels for each diagnosis.
- **Model Inference**: Utilizes TensorFlow and EfficientNetB0 for X-ray image classification.

---

## Tech Stack

### Frontend:

- **React.js**: For building a dynamic, component-based UI.
- **Tailwind CSS**: For styling the application with utility-first CSS.
- **Axios**: For making HTTP requests to the backend API.
- **React Router**: For handling in-app navigation.
- **React Toastify**: For notifications (success/error messages).

### Backend:

- **FastAPI**: For building RESTful APIs and handling AI model inference.
- **SQLite**: A lightweight database for managing user, patient, and test data.
- **TensorFlow & Keras**: For building and running the AI model for X-ray classification.
- **ReportLab**: For generating PDF reports of test results.
- **JWT**: For secure authentication and role-based access control (RBAC).

---

## Installation

### Prerequisites

- **Node.js** (version 14 or higher)
- **Python** (version 3.8 or higher)
- **npm** or **yarn** (for frontend package management)

---

### Backend Installation

1. **Clone the repository**

```bash
git clone https://github.com/BiniDevX/LDCS.git
cd LDCS/backend
```

2. **Create and activate a virtual environment**

Using `venv`:

```bash
python3 -m venv env
source env/bin/activate  # On Windows: env\Scripts\activate
```

3. **Install backend dependencies**

```bash
pip install -r requirements.txt
```

4. **Set environment variables**

Create a `.env` file in the `backend` directory and add the following:

```plaintext
SECRET_KEY=your_secret_key
JWT_SECRET_KEY=your_jwt_secret_key
```

- **SECRET_KEY**: Used for encrypting sensitive data.
- **JWT_SECRET_KEY**: Used for JWT token encryption.

5. **Create an admin user**

Run the `create_admin_user.py` script to create an initial admin user for the system:

```bash
python create_admin_user.py
```

- Default credentials:
  - **Username**: `admin`
  - **Password**: `@Adminpassword123`

6. **Run the FastAPI server**

```bash
uvicorn main:app --reload
```

This will start the backend server on `http://127.0.0.1:8000`.

---

### Frontend Installation

1. **Navigate to the frontend directory**

```bash
cd ../frontend
```

2. **Install frontend dependencies**

```bash
npm install
```

or if you are using `yarn`:

```bash
yarn install
```

3. **Configure environment variables**

Create a `.env` file in the `frontend` directory with the following content:

```plaintext
REACT_APP_API_BASE_URL=http://127.0.0.1:8000
```

4. **Run the development server**

```bash
npm start
```

The frontend will now be running on `http://localhost:3000`.

---

## API Documentation

The backend provides several RESTful API endpoints for managing users, patients, and diagnostic tests.

### Authentication

- **Login**: POST `/api/login`

  - Body: `{ "username": "admin", "password": "@Adminpassword123" }`
  - Returns: `access_token`

- **Get Current User**: GET `/api/users/me`
  - Headers: `Authorization: Bearer <access_token>`
  - Returns: Current user info.

### Patient Management

- **Add Patient**: POST `/api/patients`

  - Headers: `Authorization: Bearer <access_token>`
  - Body: `{ "name": "John Doe", "dateOfBirth": "1990-01-01", "gender": "Male", ... }`
  - Returns: `patient_id`

- **Get Patients**: GET `/api/patients`

  - Headers: `Authorization: Bearer <access_token>`
  - Returns: List of patients.

- **Get Patient Details**: GET `/api/patients/{patient_id}`
  - Headers: `Authorization: Bearer <access_token>`
  - Returns: Detailed patient info.

### Test Management

- **Upload X-ray**: POST `/api/tests`

  - Headers: `Authorization: Bearer <access_token>`
  - Body: Multipart form data containing the X-ray image and `patientId`.
  - Returns: Test results and confidence scores.

- **Download PDF Report**: GET `/api/report/download/{test_id}`
  - Headers: `Authorization: Bearer <access_token>`
  - Returns: PDF report of the diagnostic test.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
