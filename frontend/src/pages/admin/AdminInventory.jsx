import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AdminInventory = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [selectedItems, setSelectedItems] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate fetching inventory data
  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock data
        const mockData = [
          {
            id: 1,
            date: "03/04/2025",
            status: "Lost",
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@example.com",
            phone: "(555) 123-4567",
            item: "Laptop - MacBook Pro 13-inch, Space Gray, with charger",
            location: "Library, 2nd floor study area near the windows",
            details:
              "Left it on the table while getting coffee. Has a sticker of a mountain on the cover.",
          },
          {
            id: 2,
            date: "03/03/2025",
            status: "Found",
            firstName: "Jane",
            lastName: "Smith",
            email: "jane.smith@example.com",
            phone: "(555) 987-6543",
            item: "Smartphone - iPhone 13, Black, with blue case",
            location: "Cafeteria, on a table near the entrance",
            details:
              "Found during lunch hour. Screen has a small crack in the corner. No passcode.",
          },
          {
            id: 3,
            date: "03/02/2025",
            status: "Found",
            firstName: "Michael",
            lastName: "Johnson",
            email: "michael.j@example.com",
            phone: "(555) 456-7890",
            item: "Backpack - Black Jansport with red zipper",
            location: "Gym locker room, bench near shower area",
            details:
              "Contains textbooks, notebooks, and a water bottle. Name tag inside says 'Michael J.'",
          },
          {
            id: 4,
            date: "03/01/2025",
            status: "Lost",
            firstName: "Emily",
            lastName: "Wilson",
            email: "e.wilson@example.com",
            phone: "(555) 234-5678",
            item: "Wallet - Brown leather with ID and credit cards",
            location: "Student center, near the vending machines",
            details:
              "Contains student ID, driver's license, and two credit cards. Small tear on one corner.",
          },
        ];

        setInventoryItems(mockData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching inventory data:", error);
        setIsLoading(false);
      }
    };

    fetchInventoryData();
  }, []);
  const handleLogout = () => {
    localStorage.removeItem("isAdminLoggedIn");
    navigate("/admin");
  };

  const handleCheckboxChange = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((item) => item !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedItems.length === inventoryItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(inventoryItems.map((item) => item.id));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedItems.length === 0) return;

    if (
      window.confirm(
        `Are you sure you want to delete ${selectedItems.length} item(s)?`
      )
    ) {
      setInventoryItems(
        inventoryItems.filter((item) => !selectedItems.includes(item.id))
      );
      setSelectedItems([]);
    }
  };

  const filteredItems = inventoryItems.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.firstName.toLowerCase().includes(searchLower) ||
      item.lastName.toLowerCase().includes(searchLower) ||
      item.email.toLowerCase().includes(searchLower) ||
      item.item.toLowerCase().includes(searchLower) ||
      item.status.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Main Content */}
      <div className="flex-1 container mx-auto px-6 py-8">
        {/* Title with border lines */}
        <div className="relative py-6 mb-8">
          <div className="border-t-4 border-black absolute top-0 left-0 right-0"></div>
          <h1 className="text-6xl font-bold text-black my-4">Inventory</h1>
          <div className="border-t-4 border-black absolute bottom-0 left-0 right-0"></div>
        </div>
        <button
          onClick={handleLogout}
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
        >
          Logout
        </button>
        {/* Search and Filter Bar */}
        <div className="bg-black p-4 flex items-center justify-between mb-0">
          <div className="flex space-x-4">
            <select
              className="bg-black text-white border border-white rounded px-4 py-2"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date">Sort By</option>
              <option value="name">Name</option>
              <option value="status">Status</option>
              <option value="date">Date</option>
            </select>

            <button
              className="bg-[#e2231a] text-white border border-[#e2231a] rounded px-4 py-2 hover:bg-red-700 transition-colors"
              onClick={handleDeleteSelected}
              disabled={selectedItems.length === 0}
            >
              Delete Selected
            </button>
          </div>

          <div className="flex items-center">
            <input
              type="text"
              placeholder="Type to Search"
              className="px-4 py-2 rounded"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="ml-2 bg-white rounded-full p-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#e2231a]"></div>
          </div>
        ) : (
          /* Table */
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              {/* Table Header */}
              <thead>
                <tr className="bg-[#e2231a] text-white">
                  <th className="py-3 px-4 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selectedItems.length === inventoryItems.length &&
                        inventoryItems.length > 0
                      }
                      onChange={handleSelectAll}
                      className="h-4 w-4"
                    />
                  </th>
                  <th className="py-3 px-4 text-left">Image</th>
                  <th className="py-3 px-4 text-left">Date</th>
                  <th className="py-3 px-4 text-left">Lost or Found</th>
                  <th className="py-3 px-4 text-left">First name</th>
                  <th className="py-3 px-4 text-left">Last name</th>
                  <th className="py-3 px-4 text-left">Email</th>
                  <th className="py-3 px-4 text-left">Phone Number</th>
                  <th className="py-3 px-4 text-left">
                    What is lost or found?
                  </th>
                  <th className="py-3 px-4 text-left">
                    Where was it lost or found
                  </th>
                  <th className="py-3 px-4 text-left">Details</th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="py-4 text-center text-gray-500">
                      No items found. Try adjusting your search.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => handleCheckboxChange(item.id)}
                          className="h-4 w-4"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="w-16 h-16 border border-gray-300 flex items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-8 w-8 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      </td>
                      <td className="py-3 px-4">{item.date}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            item.status === "Lost"
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">{item.firstName}</td>
                      <td className="py-3 px-4">{item.lastName}</td>
                      <td className="py-3 px-4">{item.email}</td>
                      <td className="py-3 px-4">{item.phone}</td>
                      <td className="py-3 px-4 max-w-xs">
                        <div className="truncate">{item.item}</div>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <div className="truncate">{item.location}</div>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <div className="truncate">{item.details}</div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminInventory;
