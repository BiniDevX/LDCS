import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const SubmitTest = () => {
  const { patientId } = useParams();
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();

  // Get API URL from environment
  const apiUrl = process.env.REACT_APP_API_URL;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError("Please upload a file to proceed with the test.");
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedFile);
    formData.append("patientId", parseInt(patientId, 10));

    const token = localStorage.getItem("accessToken");

    setIsSubmitting(true);
    try {
      await axios.post(`${apiUrl}/api/tests`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Test submitted successfully!");
      setSelectedFile(null);
      setPreview(null);
      navigate(`/patients/${patientId}`);
    } catch (error) {
      setError("Failed to submit the test. Please try again.");
      toast.error("Failed to submit the test. Please try again.");
      console.error("Error during test submission:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md space-y-4">
      <h2 className="text-center text-lg leading-6 font-semibold text-gray-900 mb-4">
        Submit New Test for Patient
      </h2>

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-4"
      />

      {preview && (
        <div className="mt-4 text-center">
          <img
            src={preview}
            alt="Selected file preview"
            className="rounded-md max-h-60 mx-auto shadow-md border"
          />
        </div>
      )}

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className={`mt-4 w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition duration-200 transform ${
          isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:scale-105"
        }`}
      >
        {isSubmitting ? "Submitting..." : "Submit Test"}
      </button>
    </div>
  );
};

export default SubmitTest;
