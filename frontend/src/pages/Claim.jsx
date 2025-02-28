import React, { useState } from "react";
import Navbar from "../components/Navbar";
import RedAccentBar from "../components/RedAccentBar";

const Claim = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    verificationCode: "",
  });
  const [showQR, setShowQR] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowQR(true);
    // Handle form submission logic here
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
            <div className="absolute right-6.5 top-0 bottom-0 w-[30px] bg-[#e2231a]"></div>
            <div className="relative right-0 top-0 left-223 h-[30px] w-[300px] bg-[#e2231a]"></div>

            {/* Form Section */}
            <div className="max-w-7xl mx-auto w-full  px-6 pb-12">
              <div className="relative">
                {/* Form */}
                <div className="bg-black text-white p-8 pr-16">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Form Title */}
                    <div className="max-w-7xl mx-auto w-full px-6 py-4">
                      <div className="relative py-4 px-8">
                        <h2 className="text-2xl font-bold">
                          Make your claim and <br />
                          retreive your QR code
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
                            className="w-[400px] bg-white rounded border border-white text-black px-3 py-2"
                            placeholder="Last name"
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
                      />
                    </div>

                    <div className="px-12">
                      <label className="block mb-2">Verification code</label>
                      <input
                        type="text"
                        name="verificationCode"
                        value={formData.verificationCode}
                        onChange={handleInputChange}
                        className="w-[500px] bg-white rounded border border-white text-black px-3 py-2"
                      />
                      <span className="text-xs mt-1 text-[#a9a9a9] block">
                        Enter your verification code you received
                      </span>
                    </div>

                    <div className="flex justify-center pt-4 px-100">
                      <button
                        type="submit"
                        className="bg-[#e2231a] hover:bg-[#c2231a] text-white px-12 py-2 rounded cursor-pointer transition-colors duration-200 w-full"
                      >
                        Verify
                      </button>
                    </div>

                    {showQR && (
                      <div className="mt-8 space-y-4">
                        <div className="w-64 h-64 bg-white mx-auto"></div>
                        <button
                          type="button"
                          className="bg-[#e2231a] hover:bg-[#c2231a] text-white px-12 py-2 rounded cursor-pointer transition-colors duration-200 w-full"
                        >
                          Download QR Code
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Claim;
