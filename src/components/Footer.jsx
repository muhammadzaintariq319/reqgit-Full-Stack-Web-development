import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-gray-200 py-6 mt-auto bg-white">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Left Section: Brand & Copyright */}
        <div className="flex items-center gap-2">
          <span className="text-blue-600 font-bold text-lg tracking-tight">ReqGit</span>
          <span className="text-slate-500 text-sm">
            © {currentYear} ReqGit. All rights reserved.
          </span>
        </div>

        {/* Right Section: Functional Links */}
        <div className="flex items-center gap-6">
          <Link 
            to="/privacy-policy" 
            className="text-slate-600 hover:text-blue-600 text-sm font-medium transition-colors"
          >
            Privacy Policy
          </Link>
          <Link 
            to="/terms-of-service" 
            className="text-slate-600 hover:text-blue-600 text-sm font-medium transition-colors"
          >
            Terms of Service
          </Link>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
