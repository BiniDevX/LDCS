import React from "react";
import { Link } from "react-router-dom";
import Footer from "./Footer";
import { FaClock, FaChartLine, FaLaptop } from "react-icons/fa";

function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900">
      {/* Full Page Header Section with Background Image */}
      <header
        className="relative bg-cover bg-center text-white h-screen"
        style={{
          backgroundImage:
            "url('https://plus.unsplash.com/premium_photo-1677507321921-e6b32f7eb6e6?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
        }}
        role="banner"
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="relative z-10 max-w-7xl mx-auto h-full flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-5xl sm:text-7xl font-extrabold mb-6 tracking-tight leading-tight">
            Advanced AI for Lung Disease Detection
          </h1>
          <p className="max-w-2xl text-lg sm:text-2xl mb-8 leading-relaxed text-gray-200">
            Empowering accurate and quick diagnosis of lung conditions for
            better healthcare outcomes.
          </p>
          <Link
            to="/login"
            className="bg-gradient-to-r from-blue-500 to-teal-500 text-white font-semibold py-3 px-10 rounded-full shadow-xl transition-transform duration-300 hover:shadow-2xl hover:scale-105"
            aria-label="Login to Get Started"
          >
            Login to Get Started
          </Link>
        </div>
      </header>

      {/* Why Choose Our AI Tool Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-semibold mb-16">
            Why Choose Our AI Tool?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                title: "Rapid Diagnosis",
                description:
                  "Utilize AI technology for quick and reliable lung disease diagnosis.",
                icon: (
                  <FaClock className="w-14 h-14 mx-auto mb-4 text-blue-500 transition-transform transform hover:scale-110" />
                ),
              },
              {
                title: "Comprehensive Insights",
                description:
                  "Access in-depth analysis of various lung conditions seamlessly.",
                icon: (
                  <FaChartLine className="w-14 h-14 mx-auto mb-4 text-blue-500 transition-transform transform hover:scale-110" />
                ),
              },
              {
                title: "User-Centric Design",
                description:
                  "Enjoy an intuitive interface designed for healthcare professionals.",
                icon: (
                  <FaLaptop className="w-14 h-14 mx-auto mb-4 text-blue-500 transition-transform transform hover:scale-110" />
                ),
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white shadow-md rounded-xl p-10 hover:shadow-lg transition-all duration-300"
                role="article"
                aria-labelledby={`feature-${index}`}
              >
                {feature.icon}
                <h3
                  id={`feature-${index}`}
                  className="text-2xl font-semibold mb-4"
                >
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="bg-gradient-to-r from-blue-600 to-teal-600 text-white py-20">
        <div className="max-w-7xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl sm:text-6xl font-bold mb-8 leading-tight">
            Join the AI Revolution in Healthcare
          </h2>
          <p className="text-lg sm:text-xl max-w-3xl mx-auto mb-12 leading-relaxed">
            Start diagnosing lung diseases efficiently and effectively with our
            AI tool. Transform the way healthcare works and make a positive
            impact on patient outcomes.
          </p>
        </div>
      </section>

      {/* Footer Section */}
      <Footer />
    </div>
  );
}

export default Home;
