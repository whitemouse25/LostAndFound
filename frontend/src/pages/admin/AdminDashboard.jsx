import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { getAllItems, createItem, updateItem, deleteItem, adminSendVerificationEmail } from "../../services/itemService";
import { isAdminAuthenticated } from "../../services/authService";
import { toast } from "react-toastify";
import api from "../../api/config";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    lost: 0,
    found: 0,
    claimed: 0,
    returned: 0
  });
  const [inventoryItems, setInventoryItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [newItem, setNewItem] = useState({
    item: "",
    status: "lost",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    details: "",
    category: "Electronics",
    date: new Date().toISOString().split('T')[0],
    images: []
  });
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [verificationEmail, setVerificationEmail] = useState('');
  const [selectedItemId, setSelectedItemId] = useState('');

  useEffect(() => {
    const checkAuth = () => {
      const adminToken = localStorage.getItem('adminToken');
      const adminUser = localStorage.getItem('adminUser');

      if (!adminToken || !adminUser) {
        console.log('No admin credentials found, redirecting to login');
        navigate('/admin/login');
        return;
      }

      // Set the token in the API headers
      api.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`;

      // If we have credentials, fetch items
      fetchItems();
    };

    checkAuth();
  }, [navigate]);

  const fetchItems = async () => {
    try {
      setIsLoading(true);
      const items = await getAllItems(true);
      console.log('Fetched items:', items);
      setInventoryItems(items);

      // Calculate stats
      const stats = {
        total: items.length,
        lost: items.filter(item => item.status === 'lost').length,
        found: items.filter(item => item.status === 'found').length,
        claimed: items.filter(item => item.status === 'claimed').length,
        returned: items.filter(item => item.status === 'returned').length
      };
      setStats(stats);
    } catch (error) {
      console.error('Error fetching items:', error);
      if (error.response?.status === 401) {
        // Only redirect to login if we get a 401 error
        navigate('/admin/login');
        return;
      }
      setInventoryItems([]);
      setStats({
        total: 0,
        lost: 0,
        found: 0,
        claimed: 0,
        returned: 0
      });
      alert('Failed to fetch items. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    delete api.defaults.headers.common['Authorization'];
    navigate("/admin/login");
  };

  const handleStatusChange = async (itemId, newStatus) => {
    try {
      const validStatuses = ['lost', 'found', 'claimed', 'returned'];
      if (!validStatuses.includes(newStatus.toLowerCase())) {
        throw new Error('Invalid status value');
      }

      console.log('Updating status for item:', itemId, 'to:', newStatus);
      await updateItem(itemId, { status: newStatus });
      
      // Refresh the items list after update
      await fetchItems();
    } catch (error) {
      console.error('Error updating status:', error);
      alert(error.message || 'Failed to update status');
    }
  };

  const handleDeleteItems = async () => {
    if (selectedItems.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedItems.length} item(s)?`)) {
      try {
        await Promise.all(selectedItems.map(id => deleteItem(id)));
        setSelectedItems([]);
        await fetchItems(); // Refresh data after deletion
      } catch (error) {
        console.error('Error deleting items:', error);
        alert('Failed to delete items');
      }
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setNewItem(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const removeImage = (index) => {
    setNewItem(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const adminToken = localStorage.getItem('adminToken');
      
      if (!adminToken) {
        throw new Error('Please log in as an admin');
      }

      const formData = new FormData();
      formData.append('title', newItem.item);
      formData.append('description', newItem.details);
      formData.append('category', newItem.category);
      formData.append('status', newItem.status.toLowerCase());
      formData.append('location', newItem.location);
      formData.append('date', newItem.date);
      formData.append('contactInfo', JSON.stringify({
        firstName: newItem.firstName,
        lastName: newItem.lastName,
        email: newItem.email,
        phone: newItem.phone
      }));

      // Append images
      newItem.images.forEach((image, index) => {
        formData.append('images', image);
      });

      console.log('Creating new item with data:', Object.fromEntries(formData));
      await createItem(formData);
      
      // Reset form and close modal
      setNewItem({
        item: "",
        status: "lost",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        location: "",
        details: "",
        category: "Electronics",
        date: new Date().toISOString().split('T')[0],
        images: []
      });
      setShowAddModal(false);
      
      // Refresh the items list
      await fetchItems();
      
      alert('Item added successfully');
    } catch (error) {
      console.error('Error adding item:', error);
      alert(error.message || 'Failed to add item');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleViewDetails = (item) => {
    setSelectedItem(item);
    setShowDetailsModal(true);
  };

  const handleSendVerification = async (e) => {
    e?.preventDefault(); // Prevent form submission if called from a form
    
    if (!verificationEmail) {
      toast.error('Please enter an email address');
      return;
    }
    if (!selectedItemId) {
      toast.error('Please select an item');
      return;
    }

    try {
      setIsLoading(true);
      const response = await adminSendVerificationEmail(selectedItemId, verificationEmail);
      toast.success(response.message || 'Verification code sent successfully!');
      setVerificationEmail(''); // Clear email input after success
      setSelectedItemId(''); // Reset item selection
    } catch (error) {
      console.error('Error sending verification:', error);
      toast.error(error.message || 'Failed to send verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = (inventoryItems || [])
    .filter(item => {
      const matchesSearch = 
        (item?.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item?.reporter?.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item?.reporter?.lastName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item?.status || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === "all" || item?.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        return sortOrder === "desc" 
          ? new Date(b?.date || 0) - new Date(a?.date || 0)
          : new Date(a?.date || 0) - new Date(b?.date || 0);
      }
      return sortOrder === "desc"
        ? (b?.[sortBy] || '').localeCompare(a?.[sortBy] || '')
        : (a?.[sortBy] || '').localeCompare(b?.[sortBy] || '');
    });

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <div className="relative py-6 mb-8">
            <div className="border-t-4 border-black absolute top-0 left-0 right-0"></div>
            <div className="flex justify-between items-center">
              <h1 className="text-6xl font-bold text-black my-4">Admin Dashboard</h1>
              <div className="flex space-x-4">
                <button
                  onClick={() => navigate('/admin/claims')}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Claim Requests
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-[#e2231a] text-white px-4 py-2 rounded hover:bg-[#c41e16]"
                >
                  Add New Item
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
                >
                  Logout
                </button>
              </div>
            </div>
            <div className="border-t-4 border-black absolute bottom-0 left-0 right-0"></div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-5 gap-4 mb-6">
            <div className="bg-white p-4 rounded shadow">
              <h3>Total Items</h3>
              <p className="text-2xl">{stats.total}</p>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <h3>Lost Items</h3>
              <p className="text-2xl">{stats.lost}</p>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <h3>Found Items</h3>
              <p className="text-2xl">{stats.found}</p>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <h3>Claimed Items</h3>
              <p className="text-2xl">{stats.claimed}</p>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <h3>Returned Items</h3>
              <p className="text-2xl">{stats.returned}</p>
            </div>
          </div>

          {/* Verification Code Section */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-semibold mb-4">Send Verification Code</h2>
            <form onSubmit={handleSendVerification} className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Item
                </label>
                <select
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="">Select an item...</option>
                  {inventoryItems.map((item) => (
                    <option key={item._id} value={item._id}>
                      ID: {item._id} - {item.title} - {item.location} ({item.status})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={verificationEmail}
                  onChange={(e) => setVerificationEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !selectedItemId || !verificationEmail}
                className="bg-[#e2231a] text-white px-6 py-2 rounded-md hover:bg-[#c41e16] transition-colors disabled:opacity-50 h-[42px] flex items-center gap-2"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                )}
                Send Code
              </button>
            </form>
          </div>

          {/* Inventory Management */}
          <div>
            {/* Search and Actions Bar */}
            <div className="bg-black p-4 rounded-lg flex items-center justify-between mb-6">
              <div className="flex space-x-4">
                <button
                  onClick={handleDeleteItems}
                  disabled={selectedItems.length === 0}
                  className="bg-[#e2231a] text-white px-4 py-2 rounded disabled:opacity-50"
                >
                  Delete Selected
                </button>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 rounded"
                >
                  <option value="all">All Status</option>
                  <option value="lost">Lost</option>
                  <option value="found">Found</option>
                  <option value="claimed">Claimed</option>
                  <option value="returned">Returned</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 rounded"
                >
                  <option value="date">Sort by Date</option>
                  <option value="item">Sort by Item</option>
                  <option value="status">Sort by Status</option>
                </select>
                <button
                  onClick={() => setSortOrder(prev => prev === "desc" ? "asc" : "desc")}
                  className="px-4 py-2 rounded bg-gray-700 text-white"
                >
                  {sortOrder === "desc" ? "↓" : "↑"}
                </button>
              </div>
              <div className="flex items-center">
                <div className="relative">
                  <input
                    id="searchInput"
                    type="text"
                    placeholder="Search items..."
                    className="pl-10 pr-4 py-2 rounded w-64 border border-white bg-transparent text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        setSearchTerm(e.target.value);
                      }
                    }}
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#e2231a]"></div>
              </div>
            ) : (
              /* Inventory Table */
              <div className="bg-white rounded-lg overflow-hidden shadow">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-[#e2231a]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">
                        <input
                          type="checkbox"
                          checked={selectedItems.length === inventoryItems.length && inventoryItems.length > 0}
                          onChange={() => {
                            if (selectedItems.length === inventoryItems.length) {
                              setSelectedItems([]);
                            } else {
                              setSelectedItems(inventoryItems.map(item => item._id));
                            }
                          }}
                          className="h-4 w-4"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Item</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredItems.map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item._id)}
                            onChange={() => {
                              if (selectedItems.includes(item._id)) {
                                setSelectedItems(selectedItems.filter(id => id !== item._id));
                              } else {
                                setSelectedItems([...selectedItems, item._id]);
                              }
                            }}
                            className="h-4 w-4"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item._id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(item.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={item.status || ''}
                            onChange={(e) => handleStatusChange(item._id, e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          >
                            <option value="lost">Lost</option>
                            <option value="found">Found</option>
                            <option value="claimed">Claimed</option>
                            <option value="returned">Returned</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.location}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div>
                            <div className="font-medium">
                              {item.reporter ? `${item.reporter.firstName} ${item.reporter.lastName}` : 
                               item.contactInfo ? `${item.contactInfo.firstName} ${item.contactInfo.lastName}` : 'N/A'}
                            </div>
                            <div className="text-gray-500">
                              {item.reporter?.email || item.contactInfo?.email || 'N/A'}
                            </div>
                            <div className="text-gray-500">
                              {item.reporter?.phone || item.contactInfo?.phone || 'N/A'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.description}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => handleViewDetails(item)}
                            className="text-[#e2231a] hover:text-[#c41e16] underline"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Add New Item</h2>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Item Name</label>
                  <input
                    type="text"
                    name="item"
                    value={newItem.item}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#e2231a] focus:ring-[#e2231a]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    name="category"
                    value={newItem.category}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#e2231a] focus:ring-[#e2231a]"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Documents">Documents</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    name="status"
                    value={newItem.status}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#e2231a] focus:ring-[#e2231a]"
                  >
                    <option value="lost">Lost</option>
                    <option value="found">Found</option>
                    <option value="claimed">Claimed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={newItem.location}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#e2231a] focus:ring-[#e2231a]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={newItem.firstName}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#e2231a] focus:ring-[#e2231a]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={newItem.lastName}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#e2231a] focus:ring-[#e2231a]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={newItem.email}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#e2231a] focus:ring-[#e2231a]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={newItem.phone}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#e2231a] focus:ring-[#e2231a]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Details</label>
                <textarea
                  name="details"
                  value={newItem.details}
                  onChange={handleInputChange}
                  required
                  rows="3"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#e2231a] focus:ring-[#e2231a]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Images</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="mt-1 block w-full"
                />
                {newItem.images.length > 0 && (
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {newItem.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#e2231a] text-white rounded-md hover:bg-[#c41e16]"
                >
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold">Item Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Basic Information</h3>
                <p><strong>Title:</strong> {selectedItem.title}</p>
                <p><strong>Category:</strong> {selectedItem.category}</p>
                <p><strong>Status:</strong> {selectedItem.status}</p>
                <p><strong>Location:</strong> {selectedItem.location}</p>
                <p><strong>Date:</strong> {new Date(selectedItem.date).toLocaleDateString()}</p>
                <p><strong>Description:</strong> {selectedItem.description}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
                <p><strong>Name:</strong> {selectedItem.reporter ? `${selectedItem.reporter.firstName} ${selectedItem.reporter.lastName}` : 
                   selectedItem.contactInfo ? `${selectedItem.contactInfo.firstName} ${selectedItem.contactInfo.lastName}` : 'N/A'}</p>
                <p><strong>Email:</strong> {selectedItem.reporter?.email || selectedItem.contactInfo?.email || 'N/A'}</p>
                <p><strong>Phone:</strong> {selectedItem.reporter?.phone || selectedItem.contactInfo?.phone || 'N/A'}</p>
              </div>
            </div>
            {selectedItem.images && selectedItem.images.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedItem.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Item image ${index + 1}`}
                      className="w-full h-48 object-cover rounded"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDashboard;
