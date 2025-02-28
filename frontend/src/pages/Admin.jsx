import React from "react";
import Navbar from "../components/Navbar";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Admin = () => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
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
            <h1 className="text-7xl font-bold text-black mb-4">Admin Log In</h1>
            <div className="border-4 border-black"></div>
          </div>

          {/* Login Form Container */}
          <div className="w-full max-w-3xl mx-auto px-8 relative">
            {/* Red Accent Bars */}
            <div className="absolute right-3 top-0 bottom-0 w-[30px] bg-[#e2231a]"></div>
            <div className="relative right-0 top-0 left-105 h-[30px] w-[300px] bg-[#e2231a]"></div>

            {/* Form */}
            <div className="bg-black text-white p-12 pr-16 mx-auto">
              <h2 className="text-3xl font-bold mb-10 text-center">
                Admin Login
              </h2>

              <div className="max-w-xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-8 ml-21 py-10">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-lg mb-3">Email</label>
                      <input
                        type="email"
                        required
                        value={credentials.email}
                        onChange={(e) =>
                          setCredentials({
                            ...credentials,
                            email: e.target.value,
                          })
                        }
                        className="w-[400px] p-3 rounded bg-white text-black text-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-lg mb-3">Password</label>
                      <input
                        type="password"
                        required
                        value={credentials.password}
                        onChange={(e) =>
                          setCredentials({
                            ...credentials,
                            password: e.target.value,
                          })
                        }
                        className="w-[400px] p-3 rounded bg-white text-black text-lg"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-[400px] cursor-pointer bg-[#e2231a] text-white py-3 px-6 rounded text-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 mt-8"
                  >
                    {isLoading ? "Logging in..." : "Login"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="py-6 text-center text-sm text-gray-600 mt-12">
          Copyright © FanshaweCollege 2025
        </footer>
      </div>
    </>
  );
};

export default Admin;
