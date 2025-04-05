import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { isAdminAuthenticated, logoutAdmin } from "../services/authService";
import fanshaweLogoSrc from "../assets/fanshawe-logo.png"; // Adjust the path according to your assets folder structure
import { toast } from "react-toastify";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = isAdminAuthenticated();
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Don't show navbar on admin login page
  if (location.pathname === '/admin/login') {
    return null;
  }

  const handleLogout = () => {
    // Call the logoutAdmin function from authService
    logoutAdmin();
    
    // Show success message
    toast.success('Logged out successfully');
    
    // Redirect to login page
    navigate('/admin/login');
  };

  return (
    <header className="bg-[#FAFAFA] py-4 px-6 shadow-sm h-20">
      <div className="container mx-auto flex justify-between items-center">
        <div className="w-32">
          <img
            src={fanshaweLogoSrc || "/placeholder.svg"}
            alt="Fanshawe College"
            className="w-[286px] h-[55px] object-contain"
          />
        </div>
        <nav>
          <ul className="flex space-x-7 mr-12">
            {isAdmin && isAdminRoute ? (
              // Admin Navigation
              <>
                <li>
                  <Link
                    to="/admin/dashboard"
                    className="text-gray-700 hover:text-red-600 transition-colors duration-200"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="text-gray-700 hover:text-red-600 transition-colors duration-200"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              // Public Navigation
              <>
                <li>
                  <Link
                    to="/"
                    className="text-gray-700 hover:text-red-600 transition-colors duration-200"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/report"
                    className="text-gray-700 hover:text-red-600 transition-colors duration-200"
                  >
                    Report Item
                  </Link>
                </li>
                <li>
                  <Link
                    to="/claim"
                    className="text-gray-700 hover:text-red-600 transition-colors duration-200"
                  >
                    Claim Item
                  </Link>
                </li>
                {!isAdminRoute && (
                  <li>
                    <Link
                      to="/admin/login"
                      className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded"
                    >
                      Admin
                    </Link>
                  </li>
                )}
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
