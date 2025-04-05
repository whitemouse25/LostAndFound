import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import Navbar from "../components/Navbar";
import buildingImage from "../assets/building.png";
import { createPublicReport } from "../services/itemService";

const Report = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState([]);
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
      const selectedFiles = Array.from(files);
      setFormData((prev) => ({
        ...prev,
        images: selectedFiles,
      }));

      // Create preview URLs for the selected images
      const previews = selectedFiles.map(file => URL.createObjectURL(file));
      setImagePreview(previews);
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
      toast.success('Report submitted successfully!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      navigate("/");
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.message || "Error submitting report");
      toast.error(err.message || "Error submitting report", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Clean up preview URLs when component unmounts
  React.useEffect(() => {
    return () => {
      imagePreview.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imagePreview]);

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
                  placeholder="e.g., iPhone 13, Black Backpack, Student ID Card"
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
                <label className="block mb-2">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full bg-white rounded border border-white text-black px-3 py-2"
                  required
                >
                  <option value="lost">Lost</option>
                  <option value="found">Found</option>
                </select>
              </div>

              <div>
                <label className="block mb-2">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full bg-white rounded border border-white text-black px-3 py-2"
                  placeholder="e.g., Room 101, Library, Student Center, Parking Lot A"
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
                <label className="block mb-2">Name</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full bg-white rounded border border-white text-black px-3 py-2"
                      placeholder="Enter your first name"
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
                      placeholder="Enter your last name"
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
                  placeholder="example@fanshawe.ca"
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
                  placeholder="+1 (123) 456-7890"
                  required
                />
              </div>

              <div>
                <label className="block mb-2">Detailed Information</label>
                <textarea
                  name="detailedInfo"
                  value={formData.detailedInfo}
                  onChange={handleInputChange}
                  className="w-full bg-white rounded border border-white text-black px-3 py-2 h-32"
                  placeholder="Describe your item in detail (color, size, brand, distinguishing features, etc.)"
                  required
                ></textarea>
              </div>

              <div>
                <label className="block mb-2">Images (Optional)</label>
                <input
                  type="file"
                  name="images"
                  onChange={handleInputChange}
                  className="w-full bg-white rounded border border-white text-black px-3 py-2"
                  accept="image/*"
                  multiple
                />
                <p className="text-sm text-gray-400 mt-1">
                  You can upload up to 5 images (JPEG, PNG, GIF). Maximum size: 10MB each.
                </p>
              </div>

              {/* Image Preview Section */}
              {imagePreview.length > 0 && (
                <div className="mt-4">
                  <label className="block mb-2">Image Previews</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {imagePreview.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(prev => prev.filter((_, i) => i !== index));
                            setFormData(prev => ({
                              ...prev,
                              images: Array.from(prev.images).filter((_, i) => i !== index)
                            }));
                          }}
                          className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full bg-red-600 text-white py-3 rounded font-bold ${
                    loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700'
                  }`}
                >
                  {loading ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;

