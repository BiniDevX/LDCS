import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const PatientList = ({
  patients,
  onSearch,
  currentPage,
  setCurrentPage,
  itemsPerPage,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    onSearch(query);
  };

  const indexOfLastPatient = currentPage * itemsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - itemsPerPage;
  const currentPatients = patients.slice(
    indexOfFirstPatient,
    indexOfLastPatient
  );
  const totalPages = Math.ceil(patients.length / itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handlePatientClick = (patientId) => {
    navigate(`/patients/${patientId}`);
  };

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="flex justify-center mb-4">
        <input
          type="text"
          placeholder="Search patients by name or phone..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full md:w-2/3 lg:w-1/2 px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
        />
      </div>

      {/* Patient Table */}
      <div className="overflow-x-auto rounded-lg shadow-lg">
        <table className="min-w-full bg-white border border-blue-200">
          <thead className="bg-blue-800 text-white">
            <tr>
              <th className="py-4 px-6 text-left font-semibold">Name</th>
              <th className="py-4 px-6 text-left font-semibold">
                Date of Birth
              </th>
              <th className="py-4 px-6 text-left font-semibold">Gender</th>
              <th className="py-4 px-6 text-left font-semibold">Phone</th>
              <th className="py-4 px-6 text-left font-semibold">Address</th>
              <th className="py-4 px-6 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentPatients.map((patient) => (
              <tr
                key={patient.id}
                className="hover:bg-blue-50 transition duration-150"
              >
                <td className="py-4 px-6 text-left">{patient.name}</td>
                <td className="py-4 px-6 text-left">
                  {new Date(patient.date_of_birth).toLocaleDateString()}
                </td>
                <td className="py-4 px-6 text-left">{patient.gender}</td>
                <td className="py-4 px-6 text-left">
                  {patient.phone || "N/A"}
                </td>
                <td className="py-4 px-6 text-left">
                  {patient.address || "N/A"}
                </td>
                <td className="py-4 px-6 text-left">
                  <button
                    className="text-blue-600 hover:text-blue-800 font-medium underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePatientClick(patient.id);
                    }}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center mt-4 space-x-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 text-white bg-blue-600 rounded-full hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <span className="px-4 py-2 text-blue-700 font-semibold">
          Page {currentPage} of {totalPages || 1}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 text-white bg-blue-600 rounded-full hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PatientList;
