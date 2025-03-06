import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalItems: 0,
    lostItems: 0,
    foundItems: 0,
    claimedItems: 0,
  });

  // Simulate fetching dashboard data
  useEffect(() => {
    // This would be your actual API call in a real application
    const fetchDashboardData = async () => {
      try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock data
        setStats({
          totalItems: 124,
          lostItems: 78,
          foundItems: 46,
          claimedItems: 32,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);
  const handleLogout = () => {
    localStorage.removeItem("isAdminLoggedIn");
    navigate("/admin");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Main Content */}
      <div className="flex-1 container mx-auto px-6 py-8">
        {/* Dashboard Title */}
        <div className="relative py-6 mb-8">
          <div className="border-t-4 border-black absolute top-0 left-0 right-0"></div>
          <h1 className="text-6xl font-bold text-black my-4">
            Admin Dashboard
          </h1>
          <div className="border-t-4 border-black absolute bottom-0 left-0 right-0"></div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-black text-white p-6 rounded-lg">
            <h3 className="text-lg font-medium mb-2">Total Items</h3>
            <p className="text-4xl font-bold">{stats.totalItems}</p>
          </div>
          <div className="bg-black text-white p-6 rounded-lg">
            <h3 className="text-lg font-medium mb-2">Lost Items</h3>
            <p className="text-4xl font-bold">{stats.lostItems}</p>
          </div>
          <div className="bg-black text-white p-6 rounded-lg">
            <h3 className="text-lg font-medium mb-2">Found Items</h3>
            <p className="text-4xl font-bold">{stats.foundItems}</p>
          </div>
          <div className="bg-black text-white p-6 rounded-lg">
            <h3 className="text-lg font-medium mb-2">Claimed Items</h3>
            <p className="text-4xl font-bold">{stats.claimedItems}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <button
          onClick={handleLogout}
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
        >
          Logout
        </button>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Inventory Card */}
          <div
            className="bg-black text-white p-6 rounded-lg cursor-pointer hover:bg-gray-900 transition-colors"
            onClick={() => navigate("/admin/inventory")}
          >
            <h2 className="text-2xl font-bold mb-4">Inventory Management</h2>
            <p className="mb-4">Manage lost and found items in the system.</p>
            <div className="flex justify-end">
              <button className="bg-[#e2231a] text-white px-4 py-2 rounded hover:bg-red-700 transition-colors">
                View Inventory
              </button>
            </div>
          </div>

          {/* Claims Card */}
          <div className="bg-black text-white p-6 rounded-lg cursor-pointer hover:bg-gray-900 transition-colors">
            <h2 className="text-2xl font-bold mb-4">Claims Management</h2>
            <p className="mb-4">Review and process user claims.</p>
            <div className="flex justify-end">
              <button className="bg-[#e2231a] text-white px-4 py-2 rounded hover:bg-red-700 transition-colors">
                View Claims
              </button>
            </div>
          </div>

          {/* Reports Card */}
          <div className="bg-black text-white p-6 rounded-lg cursor-pointer hover:bg-gray-900 transition-colors">
            <h2 className="text-2xl font-bold mb-4">Reports</h2>
            <p className="mb-4">Generate and view system reports.</p>
            <div className="flex justify-end">
              <button className="bg-[#e2231a] text-white px-4 py-2 rounded hover:bg-red-700 transition-colors">
                View Reports
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#e2231a]">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                >
                  Action
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                >
                  Item
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  03/04/2025
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Item Added
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Laptop (MacBook Pro)
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Found
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  03/03/2025
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Claim Processed
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Smartphone (iPhone)
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    Claimed
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  03/02/2025
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Item Added
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Wallet (Brown Leather)
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                    Lost
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
