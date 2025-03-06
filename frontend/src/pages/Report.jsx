import React, { useState } from "react";
import Navbar from "../components/Navbar";
import buildingImage from "../assets/building.png";

const Report = () => {
  const [formData, setFormData] = useState({
    itemDescription: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    purpose: "lost",
    whatItem: "",
    whenDate: "",
    whereLocation: "",
    detailedInfo: "",
    image: null,
  });

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Add your form submission logic here
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#fafafa]">
      <Navbar />

      {/* Hero Section */}
      <div className="relative h-[500px] w-full">
        <img
          src={buildingImage} // Replace with your actual hero image
          alt="College Building"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <h1 className="text-white text-7xl font-black text-center">
            Have You Lost
            <br />
            Something?
          </h1>
        </div>
      </div>

      {/* Form Title */}
      <div className="max-w-7xl mx-auto w-full px-6 py-4">
        <div className="relative py-4">
          <h2 className="text-4xl font-bold">Lost and Found Form</h2>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black"></div>
        </div>
      </div>

      {/* Form Section */}
      <div className="max-w-7xl mx-auto w-full mt-10 px-6 pb-12">
        <div className="relative">
          {/* Red accent bar */}
          <div className="absolute right-0 top-0 bottom-0 w-[30px] bg-[#e2231a]"></div>
          <div className="relative right-0 top-0 left-227 h-[30px] w-[300px] bg-[#e2231a]"></div>
          {/* Form */}
          <div className="bg-black text-white p-8 pr-16">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-2xl font-bold mb-2">
                  What have you lost
                  <br />
                  or found?
                </label>
              </div>

              <div>
                <label className="block mb-2">Name</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full bg-white rounded border border-white text-white px-3 py-2"
                      placeholder="First name"
                    />
                    <span className="text-xs mt-1 text-[#a9a9a9] block">
                      First name
                    </span>
                  </div>
                  <div>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full bg-white rounded border border-white text-white px-3 py-2"
                      placeholder="Last name"
                    />
                    <span className="text-xs mt-1 text-[#a9a9a9] block">
                      Last name
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-white rounded border border-white text-white px-3 py-2"
                />
                <span className="text-xs mt-1  text-[#a9a9a9] block">
                  Email
                </span>
              </div>

              <div>
                <label className="block mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full bg-white rounded border border-white text-white px-3 py-2"
                />
                <span className="text-[#a9a9a9] text-xs mt-1 block">
                  (000) 000-0000
                </span>
              </div>

              <div>
                <label className="block mb-2">
                  What is your purpose of contact
                </label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="lost"
                      name="purpose"
                      value="lost"
                      checked={formData.purpose === "lost"}
                      onChange={handleInputChange}
                      className="border-white"
                    />
                    <label htmlFor="lost" className="text-white">
                      Lost item
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="found"
                      name="purpose"
                      value="found"
                      checked={formData.purpose === "found"}
                      onChange={handleInputChange}
                      className="border-white"
                    />
                    <label htmlFor="found" className="text-white">
                      Found item
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block mb-2">What did you lose/find?</label>
                <textarea
                  name="whatItem"
                  value={formData.whatItem}
                  onChange={handleInputChange}
                  className="w-full bg-white rounded border border-white text-white px-3 py-2 h-24"
                />
              </div>

              <div>
                <label className="block mb-2">When did you lose/find?</label>
                <input
                  type="text"
                  name="whenDate"
                  value={formData.whenDate}
                  onChange={handleInputChange}
                  className="w-full bg-white rounded border border-white text-white px-3 py-2"
                />
              </div>

              <div>
                <label className="block mb-2">Where did you lose/find?</label>
                <input
                  type="text"
                  name="whereLocation"
                  value={formData.whereLocation}
                  onChange={handleInputChange}
                  className="w-full bg-white rounded border border-white text-white px-3 py-2"
                />
              </div>

              <div>
                <label className="block mb-2">
                  Please provide detailed information about the item lost/found.
                </label>
                <textarea
                  name="detailedInfo"
                  value={formData.detailedInfo}
                  onChange={handleInputChange}
                  className="w-full bg-white rounded border border-white text-white px-3 py-2 h-32"
                />
              </div>

              <div>
                <label className="block mb-2">
                  Upload an image of the lost/found item
                </label>
                <div className="border-2 border-dashed bg-white border-white rounded-md p-6 text-center cursor-pointer">
                  <div className="flex flex-col items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10 text-black mb-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12"
                      />
                    </svg>
                    <span className="text-lg text-black font-medium">
                      Browse Files
                    </span>
                    <span className="text-sm text-black">
                      Drag and drop files here
                    </span>
                  </div>
                  <input
                    type="file"
                    name="image"
                    onChange={handleInputChange}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <button
                  type="submit"
                  className="bg-[#e2231a] hover:bg-[#c2231a] text-white px-12 py-2 rounded cursor-pointer transition-colors duration-200"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-sm text-gray-600 mt-auto">
        <p>Copyright © FanshaweCollege 2025</p>
      </footer>
    </div>
  );
};

export default Report;
