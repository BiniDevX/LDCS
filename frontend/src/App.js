import React, { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import NotFound from "./components/NotFound";
import "./App.css";
import Header from "./components/Header";
import PrivateRoute from "./components/PrivateRoute";

// Lazy load components for better performance (code splitting)
const Home = lazy(() => import("./components/Home"));
const About = lazy(() => import("./components/About"));
const Contact = lazy(() => import("./components/Contact"));
const Login = lazy(() => import("./components/Login"));
const SignUp = lazy(() => import("./components/SignUp"));
const ManagePatients = lazy(() =>
  import("./components/ManagePatients/ManagePatients")
);
const EditPatient = lazy(() =>
  import("./components/ManagePatients/EditPatient")
);
const PatientDetails = lazy(() =>
  import("./components/ManagePatients/PatientDetails")
);
const TestResults = lazy(() =>
  import("./components/ManagePatients/TestResults")
);
const SubmitTest = lazy(() => import("./components/ManagePatients/SubmitTest"));
const RegisterPatient = lazy(() =>
  import("./components/ManagePatients/RegisterPatient")
);

// ErrorBoundary to handle runtime errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by ErrorBoundary: ", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong. Please try again later.</h1>;
    }
    return this.props.children;
  }
}

const App = () => {
  return (
    <Router>
      <div className="App">
        <ErrorBoundary>
          <ConditionalHeader />
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route element={<PrivateRoute />}>
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/manage-patients" element={<ManagePatients />} />
                <Route
                  path="/edit-patient/:patientId"
                  element={<EditPatient />}
                />
                <Route
                  path="/patients/:patientId"
                  element={<PatientDetails />}
                />
                <Route path="/test/:testId" element={<TestResults />} />
                <Route
                  path="/submit-test/:patientId"
                  element={<SubmitTest />}
                />
                <Route path="/register-patient" element={<RegisterPatient />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </div>
    </Router>
  );
};

// Conditional rendering of the Header based on the route
const ConditionalHeader = () => {
  const location = useLocation();
  const hideHeaderRoutes = ["/", "/login"];

  // If the current path matches one of the paths where the header should be hidden, return null
  if (hideHeaderRoutes.includes(location.pathname)) {
    return null;
  }

  return <Header />;
};

export default App;
