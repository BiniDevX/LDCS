import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import PatientList from "./PatientList";
import RegisterPatient from "./RegisterPatient";

const ManagePatients = () => {
  const [allPatients, setAllPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(7);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);

  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${apiUrl}/api/patients`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        setAllPatients(response.data.patients || []);
        setFilteredPatients(response.data.patients || []);
      } catch (error) {
        toast.error("Failed to fetch patients.");
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [apiUrl]);

  const handleSearch = (query) => {
    const filtered = allPatients.filter(
      (patient) =>
        patient.name.toLowerCase().includes(query) ||
        (patient.phone && patient.phone.includes(query))
    );
    setFilteredPatients(filtered);
    setCurrentPage(1);
  };

  const handlePatientClick = (patientId) => {
    navigate(`/patients/${patientId}`);
  };

  const toggleRegistrationForm = () => {
    setShowRegistrationForm(!showRegistrationForm);
  };

  const handleRegistrationSuccess = () => {
    toast.success("Patient registered successfully!");
    setShowRegistrationForm(false);
    setLoading(true);
    axios
      .get(`${apiUrl}/api/patients`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })
      .then((response) => {
        setAllPatients(response.data.patients || []);
        setFilteredPatients(response.data.patients || []);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={toggleRegistrationForm}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 md:px-6 rounded-lg shadow-md transition-transform transform hover:scale-105"
        >
          {showRegistrationForm ? "Close Form" : "Register Patient"}
        </button>
      </div>

      {showRegistrationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg relative">
            <RegisterPatient onSuccess={handleRegistrationSuccess} />
            <button
              onClick={toggleRegistrationForm}
              className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <p>Loading patients...</p>
        </div>
      ) : (
        <PatientList
          patients={filteredPatients}
          onSearch={handleSearch}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
          onPatientClick={handlePatientClick}
        />
      )}
    </div>
  );
};

export default ManagePatients;
