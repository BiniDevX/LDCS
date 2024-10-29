import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

function EditPatient() {
  const [patient, setPatient] = useState({
    name: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    phone: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { patientId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("accessToken");

        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/patients/${patientId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setPatient({
          name: response.data.name,
          dateOfBirth: response.data.date_of_birth,
          gender: response.data.gender,
          address: response.data.address,
          phone: response.data.phone,
        });
      } catch (error) {
        console.error("Error fetching patient data:", error);
        setError("Failed to fetch patient data. Please try again later.");
        toast.error("Failed to fetch patient data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatient();
  }, [patientId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPatient((prevPatient) => ({ ...prevPatient, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const token = localStorage.getItem("accessToken");

    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/patients/${patientId}`,
        patient,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Patient details updated successfully.");
      navigate(`/patients/${patientId}`);
    } catch (error) {
      console.error("Error updating patient data:", error);
      setError(
        "Failed to update patient data. Please check your inputs or try again later."
      );
      toast.error("Failed to update patient data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/patients/${patientId}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-10 px-6">
      <div className="w-full max-w-2xl bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          Edit Patient Details
        </h1>
        {error && (
          <p className="mb-6 text-center text-red-600 font-medium">{error}</p>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label
                className="block text-gray-700 font-bold mb-2"
                htmlFor="name"
              >
                Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                className="w-full bg-gray-100 text-gray-700 border border-gray-300 rounded-lg py-2 px-4 leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                value={patient.name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label
                className="block text-gray-700 font-bold mb-2"
                htmlFor="dateOfBirth"
              >
                Date of Birth
              </label>
              <input
                type="date"
                name="dateOfBirth"
                id="dateOfBirth"
                className="w-full bg-gray-100 text-gray-700 border border-gray-300 rounded-lg py-2 px-4 leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                value={patient.dateOfBirth}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label
                className="block text-gray-700 font-bold mb-2"
                htmlFor="gender"
              >
                Gender
              </label>
              <select
                name="gender"
                id="gender"
                className="w-full bg-gray-100 border border-gray-300 rounded-lg py-2 px-4 leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                value={patient.gender}
                onChange={handleChange}
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label
                className="block text-gray-700 font-bold mb-2"
                htmlFor="phone"
              >
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                id="phone"
                className="w-full bg-gray-100 text-gray-700 border border-gray-300 rounded-lg py-2 px-4 leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                value={patient.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div>
            <label
              className="block text-gray-700 font-bold mb-2"
              htmlFor="address"
            >
              Address
            </label>
            <input
              type="text"
              name="address"
              id="address"
              className="w-full bg-gray-100 text-gray-700 border border-gray-300 rounded-lg py-2 px-4 leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
              value={patient.address}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex justify-center space-x-4 mt-8">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition duration-200 transform hover:scale-105 focus:outline-none"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 px-8 rounded-lg shadow-md transition duration-200 transform hover:scale-105 focus:outline-none"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditPatient;
