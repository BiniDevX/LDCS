import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faCalendarDay,
  faVenusMars,
  faPhone,
  faHome,
} from "@fortawesome/free-solid-svg-icons";

const RegisterPatient = () => {
  const [patientDetails, setPatientDetails] = useState({
    name: "",
    dateOfBirth: "",
    gender: "",
    phone: "",
    address: "",
    countryCode: "+86",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPatientDetails({ ...patientDetails, [name]: value });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    // Validate all required fields
    if (
      !patientDetails.name ||
      !patientDetails.dateOfBirth ||
      !patientDetails.gender ||
      !patientDetails.phone
    ) {
      setError("Please fill out all required fields.");
      setIsSubmitting(false);
      return;
    }

    // Concatenate country code with phone number
    const fullPhoneNumber =
      `${patientDetails.countryCode}${patientDetails.phone}`.trim();

    // Validate phone number format
    if (!/^\+?[1-9]\d{1,14}$/.test(fullPhoneNumber)) {
      setError("Invalid phone number format.");
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");

      await axios.post(
        "http://127.0.0.1:8000/api/patients",
        {
          name: patientDetails.name,
          dateOfBirth: patientDetails.dateOfBirth, // Ensure this matches the backend format (YYYY-MM-DD)
          gender: patientDetails.gender,
          phone: fullPhoneNumber,
          address: patientDetails.address,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Patient registered successfully!");
      setPatientDetails({
        name: "",
        dateOfBirth: "",
        gender: "",
        phone: "",
        address: "",
        countryCode: "+86",
      });
      navigate("/manage-patients"); // Redirect to manage patients page
      setPatientDetails({
        name: "",
        dateOfBirth: "",
        gender: "",
        phone: "",
        address: "",
        countryCode: "+86",
      }); // Clear form after successful registration
    } catch (error) {
      if (error.response && error.response.status === 409) {
        setError("Phone number already registered.");
      } else {
        setError("Failed to register the patient. Please try again.");
      }
      console.error(
        "Error during patient registration:",
        error.response?.data || error.message
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen px-4 py-8">
      <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg p-6 overflow-y-auto max-h-[70vh]">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
          Register New Patient
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Patient Name */}
          <div className="relative">
            <FontAwesomeIcon
              icon={faUser}
              className="absolute top-3 left-3 text-gray-400"
            />
            <input
              type="text"
              name="name"
              value={patientDetails.name}
              onChange={handleInputChange}
              placeholder="Patient Name"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              required
            />
          </div>

          {/* Date of Birth */}
          <div className="relative">
            <FontAwesomeIcon
              icon={faCalendarDay}
              className="absolute top-3 left-3 text-gray-400"
            />
            <input
              type="date"
              name="dateOfBirth"
              value={patientDetails.dateOfBirth}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              required
            />
          </div>

          {/* Gender Selection */}
          <div className="relative">
            <FontAwesomeIcon
              icon={faVenusMars}
              className="absolute top-3 left-3 text-gray-400"
            />
            <select
              name="gender"
              value={patientDetails.gender}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Phone Number */}
          <div className="relative flex gap-1 items-center">
            <FontAwesomeIcon
              icon={faPhone}
              className="absolute top-3 left-3 text-gray-400"
            />
            <select
              name="countryCode"
              value={patientDetails.countryCode}
              onChange={handleInputChange}
              className="pl-10 pr-4 py-3 border border-r-0 rounded-l-md focus:ring-blue-500 focus:border-blue-500 shadow-sm focus:outline-none transition duration-200"
              required
            >
              <option value="+86">+86</option>
              <option value="+251">+251</option>
              <option value="+1">+1</option>
              <option value="+44">+44</option>
              <option value="+91">+91</option>
              <option value="+49">+49</option>
              <option value="+61">+61</option>
            </select>
            <input
              type="text"
              name="phone"
              value={patientDetails.phone}
              onChange={handleInputChange}
              placeholder="Phone Number"
              className="flex-grow pl-4 pr-4 py-3 border border-gray-300 rounded-r-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              required
            />
          </div>

          {/* Address */}
          <div className="relative">
            <FontAwesomeIcon
              icon={faHome}
              className="absolute top-3 left-3 text-gray-400"
            />
            <input
              type="text"
              name="address"
              value={patientDetails.address}
              onChange={handleInputChange}
              placeholder="Address"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-md shadow-md transition duration-200 transform hover:scale-105 focus:outline-none"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Registering..." : "Register Patient"}
          </button>

          {/* Error Message */}
          {error && (
            <div className="text-red-500 text-center text-sm mt-4">{error}</div>
          )}
        </form>
      </div>
    </div>
  );
};

export default RegisterPatient;
