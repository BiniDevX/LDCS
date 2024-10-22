# LDCS Frontend (Lung Disease Classification System)

This repository contains the frontend for the Lung Disease Classification System (LDCS), built using **React.js**. It provides a user-friendly interface for managing patients, uploading X-ray images for diagnostic purposes, and viewing/download test results in PDF format.

## Features

- User authentication with JWT-based authorization.
- Patient management: Add, update, delete, and view patient data.
- Upload X-ray images for diagnostic analysis.
- Display diagnostic results and confidence scores.
- View and download test reports in PDF format.
- Role-based access control for admin and standard users.
- Responsive design using Tailwind CSS.

## System Requirements

- **Node.js** (version 14 or higher)
- **npm** or **yarn** (package manager)

## Installation and Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/BiniDevX/LDCS.git
cd LDCS/frontend
```

### Step 2: Install Dependencies

Install the required packages by running:

```bash
npm install
```

or, if you are using yarn:

```bash
yarn install
```

### Step 3: Configure Environment Variables

Create a `.env` file in the frontend directory with the following content:

```plaintext
REACT_APP_API_BASE_URL=http://127.0.0.1:8000
```

- **REACT_APP_API_BASE_URL**: This is the base URL for your backend API. Make sure it matches your FastAPI backend URL.

### Step 4: Run the Application

To run the development server, execute:

```bash
npm start
```

This will start the frontend on `http://localhost:3000`. The frontend will communicate with the backend via the API base URL defined in the `.env` file.

### Step 5: Build the Application for Production

To create a production build of the application, run:

```bash
npm run build
```

The build folder will contain the production-ready files.

## Features Overview

### User Authentication

- **Login**: Users can log in with their credentials. Upon successful login, a JWT token is stored in `localStorage` for authenticating API requests.
- **Logout**: Users can log out, which clears the token and redirects them to the login page.

### Patient Management

- **Add Patient**: Allows admin or authorized users to add new patients, entering details such as name, date of birth, gender, and contact information.
- **View Patients**: Users can view a list of patients, with options to view individual patient details.
- **Edit Patient**: Users can update patient information like contact details.
- **Delete Patient**: Users can remove a patient from the system, along with all associated test data.

### Diagnostic Test Management

- **Upload X-ray**: Users can upload X-ray images for analysis by the AI model. The frontend sends the image to the backend, where it is processed and classified.
- **View Test Results**: The results of the AI analysis are displayed, showing the predicted class (e.g., Normal, Pneumonia, etc.) and the confidence score.
- **Download PDF Report**: Users can download a PDF report containing the patient’s information, X-ray image, and test results.

### Profile Management

- **View Profile**: Users can view their profile information, including their username, display name, and contact details.
- **Edit Profile**: Users can update their personal details, such as their email, phone number, and bio.
- **Upload Profile Picture**: Users can upload a new profile picture, which is displayed in the user profile section.

## Tech Stack

### Frontend

- **React.js**: A JavaScript library for building user interfaces.
- **React Router**: A declarative routing library for React that handles in-app navigation.
- **Axios**: A promise-based HTTP client used for making API requests to the backend.
- **Tailwind CSS**: A utility-first CSS framework used to style the application.
- **React Toastify**: A notification library for showing success, error, and info messages to users.
- **JWT**: Used for handling user authentication and authorization.

### Development Tools

- **ESLint**: A static code analysis tool used to ensure code quality and consistency.
- **Prettier**: A code formatter used to enforce a consistent style across the codebase.

## Folder Structure

```plaintext
frontend/
│
├── public/                # Static public assets
│
├── src/                   # Main source code for the React app
│   ├── assets/            # Images, icons, and other static assets
│   ├── components/        # Reusable UI components
│   ├── pages/             # Page-level components for different routes
│   ├── services/          # API service files (e.g., axios configuration)
│   ├── styles/            # Custom CSS and Tailwind configuration
│   ├── App.js             # Main app component and routing setup
│   ├── index.js           # Entry point for the React application
│   └── .env               # Environment variables (API base URL)
│
├── .env                   # Environment file for configuration
├── package.json           # Project metadata and dependencies
└── README.md              # Project documentation
```

### Key Components

- **App.js**: The main component that sets up the routes and renders the necessary components based on the current route.
- **Login.js**: Handles user login, capturing credentials and sending them to the backend for authentication.
- **PatientDetails.js**: Displays detailed information about a specific patient, including their test results.
- **SubmitTest.js**: Allows users to upload X-ray images for analysis.
- **Profile.js**: Displays and manages user profile information.

## API Communication

### Axios Configuration

The API service is set up using Axios for handling HTTP requests to the backend.

```javascript
import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL, // Set the base URL from the environment
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### Example API Call: Fetch Patient List

```javascript
import api from "../services/api";

export const fetchPatients = async () => {
  try {
    const response = await api.get("/api/patients");
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch patients");
  }
};
```

## Styling

The application is styled using **Tailwind CSS**, which provides a utility-first approach to designing responsive and customizable UI components. Custom styles are added in `src/styles`.

### Example Button with Tailwind

```jsx
<button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
  Submit Test
</button>
```

## Security

- **JWT Authentication**: The frontend stores the JWT token in `localStorage` to authenticate requests to protected endpoints.
- **Role-Based Access Control**: Certain features (e.g., adding/deleting patients) are restricted to admin users only.
- **Input Validation**: Forms for patient registration, profile updates, and test submissions are validated to prevent invalid data submissions.

## Testing

Testing is done using **Jest** and **React Testing Library** for unit and integration tests.

To run tests:

```bash
npm test
```

## Deployment

To deploy the frontend for production, build the app using:

```bash
npm run build
```

The build folder will contain the optimized production files, which can be deployed on any web server (e.g., **Netlify**, **Vercel**, **AWS S3**).

## License

This project is licensed under the MIT License. See the [LICENSE](../LICENSE) file for details.
