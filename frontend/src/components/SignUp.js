import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer"; // Import Footer component

function Signup() {
  const [userData, setUserData] = useState({
    username: "",
    password: "",
    display_name: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.getElementById("username").focus();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !userData.username.trim() ||
      !userData.password.trim() ||
      !userData.display_name.trim()
    ) {
      setError("All fields are required.");
      return;
    }
    if (userData.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        setSuccess("User registered successfully! Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        const data = await response.json();
        setError(data.detail || "Failed to register. Please try again.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      setError("An error occurred during signup. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      {/* Signup Form Section with Background Image */}
      <div
        className="flex items-center justify-center min-h-screen bg-cover bg-center relative"
        style={{
          backgroundImage:
            "url('https://plus.unsplash.com/premium_photo-1677507321921-e6b32f7eb6e6?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
        }}
      >
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>

        <div className="relative z-10 w-full max-w-md p-10 space-y-8 bg-white bg-opacity-90 rounded-lg shadow-2xl backdrop-blur-md">
          <h2 className="text-3xl font-extrabold text-center text-gray-800">
            Create an Account
          </h2>

          {/* Error and Success Messages */}
          {error && (
            <p
              className="text-sm text-red-600 font-semibold mb-4 text-center"
              aria-live="assertive"
            >
              {error}
            </p>
          )}
          {success && (
            <p
              className="text-sm text-green-600 font-semibold mb-4 text-center"
              aria-live="assertive"
            >
              {success}
            </p>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col space-y-2">
              <label
                htmlFor="username"
                className="text-sm font-medium text-gray-700"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                name="username"
                placeholder="Enter your username"
                className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm sm:text-sm transition duration-200 ease-in-out"
                value={userData.username}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            <div className="flex flex-col space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="Enter your password"
                className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm sm:text-sm transition duration-200 ease-in-out"
                value={userData.password}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            <div className="flex flex-col space-y-2">
              <label
                htmlFor="display_name"
                className="text-sm font-medium text-gray-700"
              >
                Display Name
              </label>
              <input
                id="display_name"
                type="text"
                name="display_name"
                placeholder="Enter your display name"
                className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm sm:text-sm transition duration-200 ease-in-out"
                value={userData.display_name}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              className={`group relative w-full flex justify-center py-3 px-4 text-sm font-medium rounded-lg text-white ${
                loading ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-transform transform hover:scale-105 shadow-md`}
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>
        </div>
      </div>
      <Footer /> {/* Add Footer component */}
    </>
  );
}

export default Signup;
