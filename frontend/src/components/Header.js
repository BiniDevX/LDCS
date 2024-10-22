import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import useLogout from "./useLogout";
import Profile from "./Profile";
import axios from "axios";

const Header = () => {
  const [profileData, setProfileData] = useState(null);
  const logout = useLogout();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get("http://localhost:8000/api/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProfileData(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUser();
  }, []);
  const [showProfile, setShowProfile] = useState(false);

  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-2 px-4 shadow-lg">
      <div className="container mx-auto flex flex-wrap justify-between items-center relative">
        <div className="flex items-center space-x-2">
          <h1
            className="text-xl md:text-3xl font-bold tracking-wide ml-4 cursor-pointer"
            onClick={() => navigate("/manage-patients")}
          >
            Patient Management System
          </h1>
        </div>
        <div className="flex items-center space-x-3 relative mt-2 md:mt-0">
          {/* Profile Section */}
          <div
            className="flex items-center space-x-2 cursor-pointer hover:bg-blue-700 p-2 rounded-full transition-all"
            onClick={() => setShowProfile(!showProfile)}
          >
            <img
              src={
                profileData?.profile_picture
                  ? `http://localhost:8000${profileData.profile_picture}`
                  : "../assets/default-avatar.jpg"
              }
              alt="Profile"
              className="w-10 h-10 md:w-14 md:h-14 rounded-full object-cover border-2 border-white"
            />
            <span className="hidden md:block text-white font-semibold text-sm">
              {profileData?.display_name || "User"}
            </span>
          </div>
          {/* Logout Button */}
          <button
            onClick={logout}
            className="flex items-center space-x-2 bg-red-600 py-1 px-3 rounded-full shadow-md hover:bg-red-700 transition-all text-xs md:text-sm"
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="text-white" />
            <span className="text-white font-semibold">Logout</span>
          </button>
        </div>
      </div>
      {/* Profile Modal */}
      {showProfile && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-4 rounded-lg shadow-2xl w-full max-w-3xl relative transform transition-transform duration-300 ease-out scale-95">
            <button
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-800 text-xl"
              onClick={() => setShowProfile(false)}
            >
              &times;
            </button>
            <Profile
              onUpdateProfile={(updatedProfile) =>
                setProfileData(updatedProfile)
              }
            />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
