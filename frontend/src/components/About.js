import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import {
  FaHeartbeat,
  FaLaptopMedical,
  FaUsers,
  FaMicroscope,
} from "react-icons/fa";

function AboutUs() {
  const aboutSections = [
    {
      title: "Our Mission",
      description:
        "We aim to revolutionize healthcare by leveraging cutting-edge AI technology to provide early detection and diagnosis of lung diseases. Our tools empower medical professionals to make faster and more accurate decisions.",
      icon: (
        <FaHeartbeat
          size={48}
          className="text-indigo-600 transition-transform transform group-hover:scale-110"
        />
      ),
    },
    {
      title: "Our Technology",
      description:
        "Our AI-driven diagnostic tool is designed to analyze lung images and detect a wide range of diseases with precision. The advanced algorithms provide medical professionals with actionable insights to improve patient outcomes.",
      icon: (
        <FaLaptopMedical
          size={48}
          className="text-indigo-600 transition-transform transform group-hover:scale-110"
        />
      ),
    },
    {
      title: "Our Team",
      description:
        "Our team is made up of experienced healthcare professionals, AI engineers, and data scientists who are passionate about improving patient care. Together, we work to bring innovative solutions to the healthcare industry.",
      icon: (
        <FaUsers
          size={48}
          className="text-indigo-600 transition-transform transform group-hover:scale-110"
        />
      ),
    },
    {
      title: "Research and Development",
      description:
        "We continuously invest in research and development to stay at the forefront of AI technology. Our commitment to innovation allows us to refine our tools and ensure they meet the highest medical standards.",
      icon: (
        <FaMicroscope
          size={48}
          className="text-indigo-600 transition-transform transform group-hover:scale-110"
        />
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navbar />

      {/* Full-Page Hero Section */}
      <header
        className="relative bg-cover bg-center text-white text-center flex items-center justify-center min-h-screen"
        style={{
          backgroundImage:
            "url('https://plus.unsplash.com/premium_photo-1677507321921-e6b32f7eb6e6?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <h1 className="text-5xl sm:text-7xl font-extrabold mb-6 leading-tight tracking-wide animate-fadeIn">
            About Us
          </h1>
          <p className="text-xl sm:text-2xl leading-relaxed max-w-3xl mx-auto animate-fadeIn delay-100">
            Learn more about how we are transforming healthcare through
            innovative AI solutions and empowering medical professionals to make
            data-driven decisions.
          </p>
        </div>
      </header>

      {/* About Sections */}
      <main className="py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-12">
          {aboutSections.map((section, index) => (
            <div
              key={index}
              className="group bg-gradient-to-br from-gray-50 to-white shadow-lg border border-gray-200 rounded-lg p-10 text-center hover:shadow-xl transition-all duration-300"
              role="article"
              aria-labelledby={`section-${index}`}
            >
              <div className="flex items-center justify-center mb-6">
                <div className="p-3 bg-indigo-100 rounded-full">
                  {section.icon}
                </div>
              </div>
              <h2
                id={`section-${index}`}
                className="text-2xl font-semibold text-indigo-600 mb-4"
              >
                {section.title}
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {section.description}
              </p>
            </div>
          ))}
        </div>
      </main>

      <section className="relative bg-gradient-to-br from-blue-800 via-indigo-600 to-blue-500 text-white py-20 text-center overflow-hidden">
        {/* Optional Wave or Pattern SVG for Background Effect */}
        <div className="absolute inset-0 opacity-70">
          <svg
            viewBox="0 0 1440 320"
            className="absolute bottom-0 w-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="#fff"
              fillOpacity="0.1"
              d="M0,224L1440,320L1440,0L0,0Z"
            ></path>
          </svg>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 tracking-tight">
            Join Us in Revolutionizing Healthcare
          </h2>
          <p className="text-lg sm:text-xl max-w-3xl mx-auto mb-10 leading-relaxed">
            We are always on the lookout for forward-thinking medical
            professionals, engineers, and innovators to join us in our mission
            to improve global health outcomes through AI-powered diagnostics.
          </p>
          <a
            href="/contact"
            className="bg-white text-indigo-600 font-semibold py-3 px-8 rounded-full shadow-lg transition-transform duration-300 hover:bg-gray-100 hover:scale-105"
            aria-label="Contact Us"
          >
            Contact Us
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default AboutUs;
