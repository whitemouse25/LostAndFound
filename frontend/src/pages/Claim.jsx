import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { claimItem } from "../services/itemService";
import { toast } from "react-toastify";

const Claim = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    itemId: ""
  });
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName) {
      toast.error("Please enter your full name");
      return false;
    }
    if (!formData.email) {
      toast.error("Please enter your email");
      return false;
    }
    if (!formData.phone) {
      toast.error("Please enter your phone number");
      return false;
    }
    if (!formData.itemId) {
      toast.error("Please enter the item ID from your email");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      const response = await claimItem(formData);
      
      if (response.success) {
        setSuccess(true);
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          itemId: ''
        });
        toast.success("Item claimed successfully!");
        
        // Redirect after 3 seconds
        setTimeout(() => {
          navigate("/");
        }, 3000);
      }
    } catch (err) {
      console.error('Claim submission error:', err);
      const errorMessage = err.response?.data?.message || "Error submitting claim";
      const errorDetails = err.response?.data?.details || "";
      setError(`${errorMessage}${errorDetails ? `: ${errorDetails}` : ''}`);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white flex flex-col">
        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          {/* Header */}
          <div className="w-full max-w-5xl text-center mb-12">
            <div className="border-4 border-black mb-4 mt-10"></div>
            <h1 className="text-7xl font-bold text-black mb-4">Make a Claim</h1>
            <div className="border-4 border-black"></div>
          </div>

          {/*Claim box container*/}
          <div className="w-full max-w-7xl mx-auto px-8 relative">
            {/*Red Accent Bar*/}
            <div className="absolute right-6.5 top-0 bottom-12 w-[30px] bg-[#e2231a]"></div>
            <div className="relative right-0 top-0 left-223 h-[30px] w-[300px] bg-[#e2231a]"></div>

            {/* Form Section */}
            <div className="max-w-7xl mx-auto w-full px-6 pb-12">
              <div className="bg-black text-white p-8 pr-16">
                {error && (
                  <div className="bg-red-600 text-white p-4 mb-6 rounded">
                    {error}
                  </div>
                )}
                
                {success ? (
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-green-600 mb-4">Claim Submitted Successfully!</h3>
                    <p className="text-white mb-4">Your claim has been submitted and is pending admin approval.</p>
                    <p className="text-gray-400 mb-6">You will be redirected to the home page in a few seconds.</p>
                    <button
                      onClick={() => navigate("/")}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                      Go to Home Page
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Form Title */}
                    <div className="max-w-7xl mx-auto w-full px-6 py-4">
                      <div className="relative py-4 px-8">
                        <h2 className="text-2xl font-bold">
                          Submit your claim details
                        </h2>
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black"></div>
                      </div>
                    </div>

                    <div className="px-12">
                      <label className="block mb-2">Name</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className="w-[400px] bg-white rounded border border-white text-black px-3 py-2"
                            placeholder="Enter your first name"
                            required
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
                            className="w-[400px] bg-white rounded border border-white text-black px-3 py-2"
                            placeholder="Enter your last name"
                            required
                          />
                          <span className="text-xs mt-1 text-[#a9a9a9] block">
                            Last name
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="px-12">
                      <label className="block mb-2">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-[400px] bg-white rounded border border-white text-black px-3 py-2"
                        placeholder="example@fanshawe.ca"
                        required
                      />
                      <span className="text-xs mt-1 text-[#a9a9a9] block">
                        Enter the email address where you received the item ID
                      </span>
                    </div>

                    <div className="px-12">
                      <label className="block mb-2">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-[400px] bg-white rounded border border-white text-black px-3 py-2"
                        placeholder="+1 (123) 456-7890"
                        required
                      />
                      <span className="text-xs mt-1 text-[#a9a9a9] block">
                        Enter a phone number where we can reach you
                      </span>
                    </div>

                    <div className="px-12">
                      <label className="block mb-2">Item ID</label>
                      <input
                        type="text"
                        name="itemId"
                        value={formData.itemId}
                        onChange={handleInputChange}
                        className="w-[400px] bg-white rounded border border-white text-black px-3 py-2"
                        placeholder="Enter the item ID from your email"
                        required
                      />
                      <span className="text-xs mt-1 text-[#a9a9a9] block">
                        The item ID was sent to your email when you reported the item
                      </span>
                    </div>

                    <div className="flex justify-center pt-4 px-100">
                      <button
                        type="submit"
                        disabled={loading}
                        className="bg-[#e2231a] hover:bg-[#c2231a] text-white px-12 py-2 rounded cursor-pointer transition-colors duration-200 w-full disabled:opacity-50"
                      >
                        {loading ? "Processing..." : "Submit Claim"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Claim;
