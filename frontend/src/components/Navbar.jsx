import React from "react";
import { Link } from "react-router-dom";
import fanshaweLogoSrc from "../assets/fanshawe-logo.png"; // Adjust the path according to your assets folder structure

const Navbar = ({
  links = [
    { path: "/", label: "Welcome" },
    { path: "/report", label: "Report" },
    { path: "/claim", label: "Claim" },
    { path: "/admin", label: "Admin" },
  ],
}) => {
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
            {links.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className="text-gray-700 hover:text-red-600 transition-colors duration-200"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
