import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Footer from "./Footer";

function Login() {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/login`,
        credentials,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true, // to include cookies if needed
        }
      );

      localStorage.setItem("accessToken", response.data.access_token);
      navigate("/manage-patients");
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setError("Invalid username or password. Please try again.");
      } else {
        setError("An error occurred during login. Please try again later.");
      }
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-cover bg-center relative">
        <div
          className="absolute inset-0 bg-gradient-to-br from-blue-900 to-indigo-700 opacity-70"
          style={{
            backgroundImage:
              "url('https://plus.unsplash.com/premium_photo-1677507321921-e6b32f7eb6e6?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></div>

        <div className="relative z-10 w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-xl">
          <h2 className="text-3xl font-bold text-center text-gray-800">
            Login to Your Account
          </h2>
          <p className="text-center text-gray-600 text-sm">
            Welcome back! Please enter your credentials to continue.
          </p>

          {error && (
            <div className="bg-red-100 text-red-800 p-2 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col space-y-1">
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
                className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition duration-200"
                value={credentials.username}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="flex flex-col space-y-1">
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
                className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition duration-200"
                value={credentials.password}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className={`w-full py-3 rounded-lg text-white font-semibold ${
                loading
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              } transition duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Login;
