import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../src/components/Navbar";
import { getAllItems, adminSendVerificationEmail, adminVerifyQRCode } from "../../services/itemService";
import { toast } from "react-toastify";

const AdminVerification = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [qrData, setQrData] = useState("");
  const [showQRScanner, setShowQRScanner] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await getAllItems();
      setItems(response);
    } catch (err) {
      setError(err.message || "Error fetching items");
      toast.error(err.message || "Error fetching items");
    } finally {
      setLoading(false);
    }
  };

  const handleSendVerification = async (itemId, email) => {
    try {
      setLoading(true);
      await adminSendVerificationEmail(itemId, email);
      toast.success("Verification code sent successfully!");
      fetchItems(); // Refresh the items list
    } catch (err) {
      toast.error(err.message || "Error sending verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyQR = async (qrData) => {
    try {
      setLoading(true);
      await adminVerifyQRCode(qrData);
      toast.success("QR code verified successfully!");
      setShowQRScanner(false);
      fetchItems(); // Refresh the items list
    } catch (err) {
      toast.error(err.message || "Error verifying QR code");
    } finally {
      setLoading(false);
    }
  };

  const handleQRScan = (data) => {
    try {
      const parsedData = JSON.parse(data);
      setQrData(parsedData);
      handleVerifyQR(parsedData);
    } catch (err) {
      toast.error("Invalid QR code data");
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-2xl">Loading...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Admin Verification</h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* QR Code Scanner Section */}
          <div className="mb-8">
            <button
              onClick={() => setShowQRScanner(!showQRScanner)}
              className="bg-[#e2231a] text-white px-4 py-2 rounded hover:bg-[#c2231a] transition-colors"
            >
              {showQRScanner ? "Close Scanner" : "Open QR Scanner"}
            </button>

            {showQRScanner && (
              <div className="mt-4">
                <h2 className="text-xl font-semibold mb-4">Scan QR Code</h2>
                {/* Add QR code scanner component here */}
                <div className="bg-gray-100 p-4 rounded">
                  <p className="text-gray-600">QR Scanner placeholder</p>
                </div>
              </div>
            )}
          </div>

          {/* Items List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div
                key={item._id}
                className="border rounded-lg p-4 hover:shadow-lg transition-shadow bg-white"
              >
                {/* Item Image */}
                {item.image && (
                  <div className="mb-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-48 object-cover rounded"
                    />
                  </div>
                )}

                {/* Item Details */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">{item.name}</h3>
                  <p className="text-gray-600">{item.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Status: {item.status}</span>
                    <span className="text-gray-500">
                      {new Date(item.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">Location: {item.location}</p>
                </div>

                {/* Reporter Information */}
                {item.reportedBy && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-medium">Reported by:</p>
                    <p className="text-sm text-gray-600">{item.reportedBy.email}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-4 flex gap-2">
                  {item.status === "reported" && (
                    <button
                      onClick={() => handleSendVerification(item._id, item.reportedBy.email)}
                      disabled={loading}
                      className="flex-1 bg-[#e2231a] text-white px-4 py-2 rounded hover:bg-[#c2231a] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Send Verification
                    </button>
                  )}
                  {item.status === "claimed" && (
                    <span className="flex-1 bg-green-100 text-green-800 px-4 py-2 rounded text-center">
                      Verified
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminVerification; 