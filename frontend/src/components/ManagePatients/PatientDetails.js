import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faVial,
  faTrashAlt,
  faUser,
  faBirthdayCake,
  faVenusMars,
  faPhone,
  faHome,
  faChevronDown,
  faChevronUp,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import TestResults from "./TestResults";
import SkeletonLoader from "../SkeletonLoader";
import { toast } from "react-toastify";

const PatientDetails = () => {
  const [patient, setPatient] = useState(null);
  const [tests, setTests] = useState([]);
  const [showTests, setShowTests] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // For search input
  const { patientId } = useParams();
  const navigate = useNavigate();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const testsPerPage = 5; // Number of tests per page

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("accessToken");

        const patientResponse = await axios.get(
          `http://127.0.0.1:8000/api/patients/${patientId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setPatient(patientResponse.data);
      } catch (error) {
        setError("Failed to load data. Try again or contact support.");
        toast.error("Failed to fetch patient data.");
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [patientId]);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");

      const testsResponse = await axios.get(
        `http://127.0.0.1:8000/api/tests/patient/${patientId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setTests(testsResponse.data);
    } catch (error) {
      setError("Failed to load tests. Try again or contact support.");
      toast.error("Failed to fetch tests.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePatient = async () => {
    const confirmation = window.confirm(
      "Are you sure you want to delete this patient?"
    );
    if (confirmation) {
      try {
        const token = localStorage.getItem("accessToken");
        await axios.delete(`http://127.0.0.1:8000/api/patients/${patientId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success("Patient deleted successfully.");
        navigate("/manage-patients");
      } catch (error) {
        toast.error("Failed to delete patient. Please try again.");
      }
    }
  };

  const toggleShowTests = () => {
    if (!showTests) {
      fetchTests();
    }
    setShowTests(!showTests);
  };

  // Filter tests based on the search query
  const filteredTests = tests.filter(
    (test) =>
      test.result.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.id.toString().includes(searchQuery)
  );

  // Pagination Logic
  const indexOfLastTest = currentPage * testsPerPage;
  const indexOfFirstTest = indexOfLastTest - testsPerPage;
  const currentTests = filteredTests.slice(indexOfFirstTest, indexOfLastTest);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const totalPages = Math.ceil(filteredTests.length / testsPerPage);

  if (loading) return <SkeletonLoader message="Loading patient data..." />;
  if (error)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center text-red-600 font-medium">{error}</div>
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="bg-white shadow-lg rounded-lg p-6 mb-10">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-6">
          Patient Details
        </h1>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4 text-center">
            Personal Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {renderDetail("Name", patient?.name, faUser, "text-blue-600")}
            {renderDetail(
              "Date of Birth",
              patient?.date_of_birth,
              faBirthdayCake,
              "text-yellow-500"
            )}
            {renderDetail(
              "Gender",
              patient?.gender,
              faVenusMars,
              "text-pink-500"
            )}
          </div>

          <h2 className="text-2xl font-semibold text-gray-700 mb-4 text-center">
            Contact Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {renderDetail("Phone", patient?.phone, faPhone, "text-green-500")}
            {renderDetail(
              "Address",
              patient?.address,
              faHome,
              "text-orange-500"
            )}
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mt-8">
          <ActionButton
            color="blue"
            icon={faEdit}
            text="Edit"
            onClick={() => navigate(`/edit-patient/${patientId}`)}
          />
          <ActionButton
            color="green"
            icon={faVial}
            text="Submit Test"
            onClick={() => navigate(`/submit-test/${patientId}`)}
          />
          <ActionButton
            color="red"
            icon={faTrashAlt}
            text="Delete"
            onClick={handleDeletePatient}
          />
        </div>
      </div>

      {/* Test Results Section */}
      <div className="bg-white shadow-lg rounded-lg p-6 transition duration-200 transform hover:scale-105">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900">
            {showTests ? "Hide Tests Conducted" : "View Tests Conducted"}
          </h2>
          <button
            onClick={toggleShowTests}
            className="focus:outline-none text-gray-600 text-xl"
          >
            <FontAwesomeIcon
              icon={showTests ? faChevronUp : faChevronDown}
              className="text-gray-600 text-xl"
            />
          </button>
        </div>
        {showTests && (
          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            {/* Search Input */}
            <div className="flex items-center mb-4">
              <FontAwesomeIcon icon={faSearch} className="mr-2 text-gray-600" />
              <input
                type="text"
                className="border border-gray-300 rounded-lg p-2 w-full"
                placeholder="Search test by result or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {filteredTests.length === 0 ? (
              <p className="text-gray-700 mt-2 text-center">
                No tests found for this patient.
              </p>
            ) : (
              <>
                {currentTests.map((test) => (
                  <div
                    key={test.id}
                    className="bg-white rounded-lg p-4 shadow-md mt-4 transition duration-300 w-full max-w-2xl mx-auto"
                  >
                    <TestResults result={test} />
                  </div>
                ))}
                {/* Pagination */}
                <div className="flex justify-between items-center mt-4">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`${
                      currentPage === 1
                        ? "opacity-50 cursor-not-allowed"
                        : "bg-blue-500 hover:bg-blue-700"
                    } text-white font-bold py-2 px-4 rounded-lg`}
                  >
                    Previous
                  </button>
                  <span className="text-gray-700 font-semibold">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`${
                      currentPage === totalPages
                        ? "opacity-50 cursor-not-allowed"
                        : "bg-blue-500 hover:bg-blue-700"
                    } text-white font-bold py-2 px-4 rounded-lg`}
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Component to render patient details
function renderDetail(label, value, icon, iconColor) {
  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-sm flex items-center space-x-4">
      <FontAwesomeIcon icon={icon} className={`text-2xl ${iconColor}`} />
      <div className="flex-1">
        <span className="block font-semibold text-gray-800">{label}:</span>
        <span className="text-gray-600">{value || "N/A"}</span>
      </div>
    </div>
  );
}

// Reusable button component for actions
const ActionButton = ({ color, icon, text, onClick }) => (
  <button
    className={`bg-${color}-500 hover:bg-${color}-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition transform hover:scale-105 focus:outline-none`}
    onClick={onClick}
  >
    <FontAwesomeIcon icon={icon} className="mr-2" /> {text}
  </button>
);

export default PatientDetails;
