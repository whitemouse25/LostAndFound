import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import buildingImage from "../assets/building.png";
import { createPublicReport } from "../services/itemService";

const Report = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    category: "Electronics",
    status: "lost",
    location: "",
    date: new Date().toISOString().split('T')[0],
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    detailedInfo: "",
    images: []
  });

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setFormData((prev) => ({
        ...prev,
        images: Array.from(files),
      }));
    } else {
    setFormData((prev) => ({
      ...prev,
        [name]: value,
    }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validate required fields
      if (!formData.title || !formData.category || !formData.status || 
          !formData.location || !formData.firstName || !formData.lastName || 
          !formData.email || !formData.phone || !formData.detailedInfo) {
        throw new Error('Please fill in all required fields');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Please enter a valid email address');
      }

      // Validate phone number format
      const phoneRegex = /^\+?[\d\s-]{10,}$/;
      if (!phoneRegex.test(formData.phone)) {
        throw new Error('Please enter a valid phone number');
      }

      // Create a copy of formData to avoid modifying the state directly
      const submitData = {
        ...formData,
        date: formData.date || new Date().toISOString().split('T')[0]
      };

      await createPublicReport(submitData);
      alert("Report submitted successfully!");
      navigate("/");
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.message || "Error submitting report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#fafafa]">
      <Navbar />

      {/* Hero Section */}
      <div className="relative h-[500px] w-full">
        <img
          src={buildingImage}
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
          <div className="absolute right-0 top-0 bottom-0 w-[30px] bg-[#e2231a]"></div>
          <div className="relative right-0 top-0 left-227 h-[30px] w-[300px] bg-[#e2231a]"></div>
          <div className="bg-black text-white p-8 pr-16">
            {error && (
              <div className="bg-red-600 text-white p-4 mb-6 rounded">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-2xl font-bold mb-2">
                  What have you lost or found?
                </label>
              </div>

              <div>
                <label className="block mb-2">Item Name</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full bg-white rounded border border-white text-black px-3 py-2"
                  placeholder="Enter item name"
                  required
                />
              </div>

              <div>
                <label className="block mb-2">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full bg-white rounded border border-white text-black px-3 py-2"
                  required
                >
                  <option value="Electronics">Electronics</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Documents">Documents</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Other">Other</option>
                </select>
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
                      className="w-full bg-white rounded border border-white text-black px-3 py-2"
                      placeholder="First name"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full bg-white rounded border border-white text-black px-3 py-2"
                      placeholder="Last name"
                      required
                    />
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
                  className="w-full bg-white rounded border border-white text-black px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full bg-white rounded border border-white text-black px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block mb-2">Status</label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="lost"
                      name="status"
                      value="lost"
                      checked={formData.status === "lost"}
                      onChange={handleInputChange}
                      className="border-white"
                      required
                    />
                    <label htmlFor="lost">Lost item</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="found"
                      name="status"
                      value="found"
                      checked={formData.status === "found"}
                      onChange={handleInputChange}
                      className="border-white"
                      required
                    />
                    <label htmlFor="found">Found item</label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block mb-2">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full bg-white rounded border border-white text-black px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block mb-2">Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full bg-white rounded border border-white text-black px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block mb-2">
                  Detailed Information
                </label>
                <textarea
                  name="detailedInfo"
                  value={formData.detailedInfo}
                  onChange={handleInputChange}
                  className="w-full bg-white rounded border border-white text-black px-3 py-2 h-32"
                  required
                />
              </div>

              <div>
                <label className="block mb-2">
                  Upload Images (Optional)
                </label>
                <div className="border-2 border-dashed bg-white border-white rounded-md p-6 text-center cursor-pointer">
                  <input
                    type="file"
                    name="images"
                    onChange={handleInputChange}
                    multiple
                    accept="image/*"
                    className="w-full"
                  />
                </div>
              </div>

                <button
                  type="submit"
                disabled={loading}
                className="w-full bg-[#e2231a] text-white py-3 px-6 rounded text-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                {loading ? "Submitting..." : "Submit Report"}
                </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;

