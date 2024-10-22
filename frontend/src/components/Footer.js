import React from "react";
import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa";

function Footer() {
  return (
    <footer id="footer" className="bg-gray-900 text-white py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-between items-center">
          {/* Company Logo and Description */}
          <div className="w-full md:w-1/3 mb-4 md:mb-0 text-center md:text-left">
            <Link to="/" className="text-2xl font-bold hover:text-teal-300">
              Lung Diagnostics
            </Link>
            <p className="text-gray-400 mt-2">
              AI-powered tools for detecting lung diseases like Tuberculosis,
              Pneumonia, and COVID-19.
            </p>
          </div>

          {/* Copyright Information */}
          <div className="w-full md:w-1/3 mb-4 md:mb-0 text-center">
            <p className="text-gray-400">
              © {new Date().getFullYear()} Lung Diagnostics. All rights
              reserved.
            </p>
          </div>

          {/* Contact Information */}
          <div className="w-full md:w-1/3 flex justify-center md:justify-end space-x-6">
            <a
              href="#footer"
              className="text-gray-400 hover:text-teal-300 transition duration-200"
              aria-label="Contact Us"
            >
              Contact Us
            </a>
            <a
              href="https://facebook.com/BiniDeVX"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-teal-300 transition duration-200"
              aria-label="Facebook"
            >
              <FaFacebookF size={24} />
            </a>
            <a
              href="https://twitter.com/BiniDevX"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-teal-300 transition duration-200"
              aria-label="Twitter"
            >
              <FaTwitter size={24} />
            </a>
            <a
              href="https://instagram.com/BiniDevX"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-teal-300 transition duration-200"
              aria-label="Instagram"
            >
              <FaInstagram size={24} />
            </a>
            <a
              href="https://linkedin.com/in/BiniDevX"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-teal-300 transition duration-200"
              aria-label="LinkedIn"
            >
              <FaLinkedinIn size={24} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
