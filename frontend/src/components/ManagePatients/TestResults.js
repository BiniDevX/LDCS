import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faInfoCircle } from "@fortawesome/free-solid-svg-icons";

const TestResults = ({ result }) => {
  const [loading, setLoading] = useState(false);

  const downloadReport = async () => {
    if (!result || !result.id) {
      toast.error("Invalid test ID. Cannot download the report.");
      return;
    }

    const token = localStorage.getItem("accessToken");
    setLoading(true);

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/report/download/${result.id}`,
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Report_${result.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

      toast.success("Report downloaded successfully.");
    } catch (error) {
      toast.error("Failed to download the report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return "bg-green-500";
    if (confidence >= 0.5) return "bg-yellow-500";
    return "bg-red-500";
  };

  const formatDateToUTC8 = (utcDate) => {
    const date = new Date(utcDate);
    const utcOffset = date.getTimezoneOffset();
    const offsetInMilliseconds = (utcOffset + 480) * 60 * 1000;
    const utc8Date = new Date(date.getTime() + offsetInMilliseconds);

    return utc8Date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  useEffect(() => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }, []);

  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded-xl shadow-md space-y-6">
      <h3 className="text-2xl font-semibold text-gray-900 mb-4 text-center">
        Test Details
      </h3>
      <ul className="text-gray-800 space-y-4">
        <li className="flex justify-between items-center border-b pb-2">
          <span className="font-medium">
            Result <FontAwesomeIcon icon={faInfoCircle} title="Predicted result" />
          </span>
          <span className="text-lg font-bold text-green-600">
            {result.result}
          </span>
        </li>
        <li className="flex justify-between items-center border-b pb-2">
          <span className="font-medium">Confidence</span>
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-blue-600">
              {(result.confidence * 100).toFixed(2)}%
            </span>
            <div className="w-40 h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${getConfidenceColor(result.confidence)}`}
                style={{ width: `${(result.confidence * 100).toFixed(2)}%` }}
              ></div>
            </div>
          </div>
        </li>
        <li className="flex justify-between items-center border-b pb-2">
          <span className="font-medium">Date Conducted</span>
          <span className="text-gray-600">
            {formatDateToUTC8(result.date_conducted)}
          </span>
        </li>
        <li className="flex justify-between items-center border-b pb-2">
          <span className="font-medium">Patient ID</span>
          <span className="text-gray-600">{result.patient_id}</span>
        </li>
        <li className="flex justify-between items-center border-b pb-2">
          <span className="font-medium">Test ID</span>
          <span className="text-gray-600">{result.id}</span>
        </li>
      </ul>
      <button
        onClick={downloadReport}
        className={`mt-6 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-transform duration-200 ease-in-out hover:scale-105 focus:outline-none ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={loading}
      >
        {loading ? (
          "Downloading..."
        ) : (
          <>
            <FontAwesomeIcon icon={faDownload} className="mr-2" /> Download
            Report
          </>
        )}
      </button>
    </div>
  );
};

export default TestResults;
