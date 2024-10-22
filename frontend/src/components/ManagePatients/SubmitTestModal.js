import React from "react";
import SubmitTest from "./SubmitTest";

const SubmitTestModal = ({ patientId, onClose }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center">
      <div className="relative mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <SubmitTest patientId={patientId} />
        <button
          onClick={onClose}
          className="mt-4 w-full bg-red-600 hover:bg-red-800 text-white font-bold py-2 px-4 rounded-full"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default SubmitTestModal;
