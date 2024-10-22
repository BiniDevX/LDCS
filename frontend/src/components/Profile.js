import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPhone,
  faPen,
  faSignOutAlt,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";
import useLogout from "./useLogout";
import defaultAvatar from "../assets/default-avatar.jpg";

const Profile = ({ onUpdateProfile }) => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    display_name: "",
    email: "",
    bio: "",
    contact_number: "",
    profile_picture: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const logout = useLogout();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get("http://localhost:8000/api/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(response.data);
      setProfileData({
        display_name: response.data.display_name,
        email: response.data.email || "",
        bio: response.data.bio || "",
        contact_number: response.data.contact_number || "",
        profile_picture: response.data.profile_picture,
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
      setErrorMessage("Failed to fetch user data. Please try again later.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("accessToken");
      await axios.put("http://localhost:8000/api/users/me", profileData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setIsEditing(false);
      fetchUser();
      if (onUpdateProfile) onUpdateProfile(profileData);
    } catch (error) {
      console.error("Error updating profile:", error);
      setErrorMessage("Failed to update profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.post(
        "http://localhost:8000/api/users/me/profile-picture",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const updatedUrl = `${
        response.data.profile_picture
      }?timestamp=${new Date().getTime()}`;
      setUser((prevUser) => ({ ...prevUser, profile_picture: updatedUrl }));
      setProfileData((prevData) => ({
        ...prevData,
        profile_picture: updatedUrl,
      }));
      if (onUpdateProfile)
        onUpdateProfile({ ...profileData, profile_picture: updatedUrl });
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      setErrorMessage("Failed to upload profile picture. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-center text-blue-700 font-semibold text-2xl">
          {errorMessage ? errorMessage : "Loading..."}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto mt-8 p-4 sm:p-6 bg-white shadow-md rounded-lg transition-all transform border-t-4 border-blue-500 overflow-y-auto max-h-[80vh]">
      <div className="flex flex-col items-center">
        <div className="relative mb-4">
          <img
            src={
              profileData.profile_picture
                ? `http://localhost:8000${profileData.profile_picture}`
                : defaultAvatar
            }
            alt="Profile"
            className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border-4 border-blue-500 shadow-md hover:shadow-lg transition-all"
            onError={() => {
              console.error(
                "Error loading profile picture. Falling back to default."
              );
            }}
          />
        </div>
        <div className="mt-2 text-center">
          <h2 className="text-3xl font-bold text-gray-800">
            {user.display_name}
          </h2>
          <p className="text-gray-500 text-lg mt-1">{user.email}</p>
        </div>
      </div>
      {isEditing ? (
        <form onSubmit={handleUpdateProfile} className="mt-6 space-y-6">
          <div className="flex flex-col items-start space-y-1">
            <label className="text-gray-600 font-medium" htmlFor="display_name">
              Display Name
            </label>
            <input
              type="text"
              name="display_name"
              value={profileData.display_name}
              onChange={handleInputChange}
              className="w-full border rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="Display Name"
            />
          </div>
          <div className="flex flex-col items-start space-y-1">
            <label className="text-gray-600 font-medium" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={profileData.email}
              onChange={handleInputChange}
              className="w-full border rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="Email"
            />
          </div>
          <div className="flex flex-col items-start space-y-1">
            <label
              className="text-gray-600 font-medium"
              htmlFor="contact_number"
            >
              Contact Number
            </label>
            <input
              type="text"
              name="contact_number"
              value={profileData.contact_number}
              onChange={handleInputChange}
              className="w-full border rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="Contact Number"
            />
          </div>
          <div className="flex flex-col items-start space-y-1">
            <label className="text-gray-600 font-medium" htmlFor="bio">
              Bio
            </label>
            <textarea
              name="bio"
              value={profileData.bio}
              onChange={handleInputChange}
              rows="3"
              className="w-full border rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="Bio (Keep it brief)"
            />
          </div>
          <div className="flex flex-col items-start space-y-1">
            <label
              className="text-gray-600 font-medium"
              htmlFor="profile_picture"
            >
              Profile Picture
            </label>
            <label className="cursor-pointer bg-blue-500 text-white py-2 px-5 rounded-md shadow-sm hover:bg-blue-600 hover:shadow-md transition-all">
              <FontAwesomeIcon icon={faUpload} className="mr-2" /> Upload
              Picture
              <input
                type="file"
                onChange={handleProfilePictureChange}
                className="hidden"
                accept=".jpg, .jpeg, .png"
              />
            </label>
            {isUploading && (
              <p className="text-sm text-gray-600 mt-2 animate-pulse">
                Uploading...
              </p>
            )}
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center mt-4 space-y-4 md:space-y-0 md:space-x-4">
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 px-5 rounded-md shadow hover:bg-blue-700 hover:shadow-lg transition-all"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update Profile"}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="bg-gray-500 text-white py-2 px-5 rounded-md shadow hover:bg-gray-600 hover:shadow-lg transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-4 space-y-4 text-center">
          <p className="text-gray-700 text-lg font-light">
            {user.bio || "This user has not added a bio yet."}
          </p>
          <p className="text-gray-600">
            <FontAwesomeIcon icon={faPhone} className="mr-2" />
            {user.contact_number ? user.contact_number : "Not provided"}
          </p>
          <div className="mt-6 space-x-4">
            <button
              onClick={() => setIsEditing(true)}
              className="bg-green-600 text-white py-2 px-6 rounded-md shadow hover:bg-green-700 hover:shadow-lg transition-all"
            >
              <FontAwesomeIcon icon={faPen} className="mr-2" /> Edit Profile
            </button>
            <button
              onClick={logout}
              className="bg-red-600 text-white py-2 px-6 rounded-md shadow hover:bg-red-700 hover:shadow-lg transition-all"
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" /> Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
