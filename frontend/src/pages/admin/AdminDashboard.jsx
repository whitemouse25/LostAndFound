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
    claimed: 0
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
      
      // Process and fix image URLs for all items
      const processedItems = items.map(item => {
        // Fix image URLs
        let fixedImages = [];
        if (item.images && item.images.length > 0) {
          fixedImages = item.images.map(image => {
            if (image.startsWith('http')) {
              return image;
            } else {
              // If not a full URL, it might be a relative path
              return `${process.env.REACT_APP_API_URL}/${image}`;
            }
          });
        }
        
        // Ensure all required fields are present
        return {
          ...item,
          images: fixedImages,
          title: item.title || 'Untitled Item',
          description: item.description || 'No description provided',
          category: item.category || 'Uncategorized',
          status: item.status || 'unknown',
          location: item.location || 'Location not specified',
          date: item.date || item.createdAt || new Date().toISOString(),
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.updatedAt || item.createdAt || new Date().toISOString(),
          reporter: item.reporter || {
            firstName: 'N/A',
            lastName: '',
            email: 'N/A',
            phone: 'N/A'
          }
        };
      });
      
      console.log('Processed items:', processedItems);
      setInventoryItems(processedItems);
      
      // Calculate statistics
      const stats = {
        total: processedItems.length,
        lost: processedItems.filter(item => item.status === 'lost').length,
        found: processedItems.filter(item => item.status === 'found').length,
        claimed: processedItems.filter(item => item.status === 'claimed').length
      };
      
      setStats(stats);
    } catch (error) {
      console.error('Error fetching items:', error);
      toast.error('Failed to fetch items. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    // Clear admin credentials from localStorage
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    
    // Remove the Authorization header from API requests
    delete api.defaults.headers.common['Authorization'];
    
    // Show success message
    toast.success('Logged out successfully');
    
    // Redirect to login page
    navigate('/admin/login');
  };

  const handleStatusChange = async (itemId, newStatus) => {
    try {
      const validStatuses = ['lost', 'found', 'claimed'];
      if (!validStatuses.includes(newStatus.toLowerCase())) {
        throw new Error('Invalid status value');
      }

      console.log('Updating status for item:', itemId, 'to:', newStatus);
      await updateItem(itemId, { status: newStatus });
      
      // Refresh the items list after update
      await fetchItems();
      toast.success('Status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error.message || 'Failed to update status');
    }
  };

  const handleDeleteItems = async () => {
    if (selectedItems.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedItems.length} item(s)?`)) {
      try {
        await Promise.all(selectedItems.map(id => deleteItem(id)));
        setSelectedItems([]);
        await fetchItems(); // Refresh data after deletion
        toast.success('Items deleted successfully');
      } catch (error) {
        console.error('Error deleting items:', error);
        toast.error('Failed to delete items');
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
    setIsLoading(true);
    try {
      const formData = new FormData();
      
      // Add basic item information
      formData.append('title', newItem.item);
      formData.append('description', newItem.details);
      formData.append('category', newItem.category);
      formData.append('status', newItem.status);
      formData.append('location', newItem.location);
      formData.append('date', newItem.date);

      // Add reporter information
      formData.append('firstName', newItem.firstName);
      formData.append('lastName', newItem.lastName);
      formData.append('email', newItem.email);
      formData.append('phone', newItem.phone);

      // Append images if they exist
      if (newItem.images && newItem.images.length > 0) {
        newItem.images.forEach((image) => {
          formData.append('images', image);
        });
      }

      console.log('Creating new item with data:', {
        title: newItem.item,
        description: newItem.details,
        category: newItem.category,
        status: newItem.status,
        location: newItem.location,
        date: newItem.date,
        firstName: newItem.firstName,
        lastName: newItem.lastName,
        email: newItem.email,
        phone: newItem.phone,
        images: newItem.images
      });

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
      await fetchItems();
      toast.success('Item added successfully');
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error(error.message || 'Failed to add item');
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
    console.log('Viewing item details:', item);
    console.log('Item images:', item.images);
    
    // Check and fix image URLs
    if (item.images && item.images.length > 0) {
      const fixedImages = item.images.map(image => {
        if (image.startsWith('http')) {
          return image;
        } else {
          // If not a full URL, it might be a relative path
          return `${process.env.REACT_APP_API_URL}/${image}`;
        }
      });
      
      console.log('Fixed images for view details:', fixedImages);
      setSelectedItem({ ...item, images: fixedImages });
    } else {
      setSelectedItem(item);
    }
    
    // Ensure all required fields are present
    const processedItem = {
      ...item,
      title: item.title || 'Untitled Item',
      description: item.description || 'No description provided',
      category: item.category || 'Uncategorized',
      status: item.status || 'unknown',
      location: item.location || 'Location not specified',
      date: item.date || item.createdAt || new Date().toISOString(),
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: item.updatedAt || item.createdAt || new Date().toISOString(),
      reporter: item.reporter || {
        firstName: 'N/A',
        lastName: '',
        email: 'N/A',
        phone: 'N/A'
      }
    };
    
    console.log('Processed item for display:', processedItem);
    setSelectedItem(processedItem);
    setShowDetailsModal(true);
  };

  const handleSendVerification = async (e) => {
    e.preventDefault();
    try {
      await adminSendVerificationEmail(selectedItemId, verificationEmail);
      toast.success('Verification email sent successfully');
      setVerificationEmail('');
      setSelectedItemId('');
    } catch (error) {
      console.error('Error sending verification email:', error);
      toast.error(error.message || 'Failed to send verification email');
    }
  };

  const filteredItems = inventoryItems
    .filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'desc' 
          ? new Date(b.createdAt) - new Date(a.createdAt)
          : new Date(a.createdAt) - new Date(b.createdAt);
      }
      return sortOrder === 'desc'
        ? b[sortBy].localeCompare(a[sortBy])
        : a[sortBy].localeCompare(b[sortBy]);
    });

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-md bg-red-600 text-white hover:bg-red-700 focus:outline-none"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isSidebarOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="h-full flex flex-col">
            <div className="p-4 border-b">
              <h2 className="text-xl font-bold text-gray-800">Admin Dashboard</h2>
            </div>
            
            <div className="flex-1 p-4">
              <div className="space-y-4">
                <div className="bg-white rounded-lg shadow p-4">
                  <h3 className="text-lg font-semibold mb-2">Statistics</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-sm text-gray-600">Total Items</p>
                      <p className="text-xl font-bold">{stats.total}</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-sm text-gray-600">Lost Items</p>
                      <p className="text-xl font-bold">{stats.lost}</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-sm text-gray-600">Found Items</p>
                      <p className="text-xl font-bold">{stats.found}</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-sm text-gray-600">Claimed Items</p>
                      <p className="text-xl font-bold">{stats.claimed}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4">
                  <h3 className="text-lg font-semibold mb-2">Actions</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition"
                    >
                      Add New Item
                    </button>
                    <button
                      onClick={() => navigate('/admin/claims')}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
                    >
                      Claim Requests
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-64 p-4">
          {/* Search and Filter Bar */}
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="p-2 border rounded"
                >
                  <option value="all">All Status</option>
                  <option value="lost">Lost</option>
                  <option value="found">Found</option>
                  <option value="claimed">Claimed</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="p-2 border rounded"
                >
                  <option value="date">Date</option>
                  <option value="title">Title</option>
                  <option value="category">Category</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedItems(filteredItems.map(item => item._id));
                          } else {
                            setSelectedItems([]);
                          }
                        }}
                        checked={selectedItems.length === filteredItems.length}
                        className="rounded"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-8 text-center">
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                        </div>
                      </td>
                    </tr>
                  ) : filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                        No items found
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedItems([...selectedItems, item._id]);
                              } else {
                                setSelectedItems(selectedItems.filter(id => id !== item._id));
                              }
                            }}
                            className="rounded"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <div>
                              <div className="font-medium text-gray-900">{item.title}</div>
                              <div className="text-sm text-gray-500">{item.location}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {item.category}
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={item.status}
                            onChange={(e) => handleStatusChange(item._id, e.target.value)}
                            className={`text-sm rounded-full px-3 py-1 ${
                              item.status === 'lost' ? 'bg-red-100 text-red-800' :
                              item.status === 'found' ? 'bg-green-100 text-green-800' :
                              item.status === 'claimed' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}
                          >
                            <option value="lost">Lost</option>
                            <option value="found">Found</option>
                            <option value="claimed">Claimed</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium">
                          <button
                            onClick={() => handleViewDetails(item)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            View
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                if (!item.reporter || !item.reporter.email) {
                                  toast.error('No contact email available for this item');
                                  return;
                                }
                                await adminSendVerificationEmail(item._id, item.reporter.email);
                                toast.success('Verification email sent successfully');
                              } catch (error) {
                                console.error('Error sending verification email:', error);
                                toast.error(error.message || 'Failed to send verification email');
                              }
                            }}
                            className="text-green-600 hover:text-green-900"
                          >
                            Verify
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedItems.length > 0 && (
            <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {selectedItems.length} item(s) selected
                </span>
                <button
                  onClick={handleDeleteItems}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Delete Selected
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Add New Item</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleAddItem} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Item Name</label>
                    <input
                      type="text"
                      name="item"
                      value={newItem.item}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <select
                      name="category"
                      value={newItem.category}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
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
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      name="status"
                      value={newItem.status}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                      required
                    >
                      <option value="lost">Lost</option>
                      <option value="found">Found</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={newItem.location}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <input
                      type="date"
                      name="date"
                      value={newItem.date}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Information</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
                    <div>
                      <input
                        type="text"
                        name="firstName"
                        value={newItem.firstName}
                        onChange={handleInputChange}
                        placeholder="First Name"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                        required
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        name="lastName"
                        value={newItem.lastName}
                        onChange={handleInputChange}
                        placeholder="Last Name"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                        required
                      />
                    </div>
                    <div>
                      <input
                        type="email"
                        name="email"
                        value={newItem.email}
                        onChange={handleInputChange}
                        placeholder="Email"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                        required
                      />
                    </div>
                    <div>
                      <input
                        type="tel"
                        name="phone"
                        value={newItem.phone}
                        onChange={handleInputChange}
                        placeholder="Phone"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Details</label>
                  <textarea
                    name="details"
                    value={newItem.details}
                    onChange={handleInputChange}
                    rows="3"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                    required
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Images</label>
                  <input
                    type="file"
                    onChange={handleImageChange}
                    multiple
                    accept="image/*"
                    className="mt-1 block w-full"
                  />
                  {newItem.images.length > 0 && (
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                      {newItem.images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Preview ${index + 1}`}
                            className="h-20 w-full object-cover rounded"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Adding...' : 'Add Item'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showDetailsModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Item Details</h2>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedItem(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Item Images - Display at the top for better visibility */}
                {selectedItem.images && selectedItem.images.length > 0 ? (
                  <div>
                    <h3 className="text-lg font-medium">Images</h3>
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                      {selectedItem.images.map((image, index) => {
                        console.log(`Rendering image ${index} in modal:`, image);
                        return (
                          <div key={index} className="relative">
                            <img
                              src={image}
                              alt={`Item image ${index + 1}`}
                              className="h-48 w-full object-cover rounded-lg shadow-md"
                              onError={(e) => {
                                console.error(`Error loading image ${index} in modal:`, image);
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-100 p-4 rounded-lg text-center">
                    <p className="text-gray-500">No images available for this item</p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-medium">Basic Information</h3>
                    <div className="mt-2 space-y-2">
                      <p><span className="font-medium">Title:</span> {selectedItem.title}</p>
                      <p><span className="font-medium">Category:</span> {selectedItem.category}</p>
                      <p><span className="font-medium">Status:</span> {selectedItem.status}</p>
                      <p><span className="font-medium">Location:</span> {selectedItem.location}</p>
                      <p><span className="font-medium">Date:</span> {new Date(selectedItem.date).toLocaleDateString()}</p>
                      <p><span className="font-medium">Created:</span> {new Date(selectedItem.createdAt).toLocaleDateString()}</p>
                      <p><span className="font-medium">Last Updated:</span> {new Date(selectedItem.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium">Contact Information</h3>
                    <div className="mt-2 space-y-2">
                      <p><span className="font-medium">Name:</span> {selectedItem.reporter?.firstName || 'N/A'} {selectedItem.reporter?.lastName || ''}</p>
                      <p><span className="font-medium">Email:</span> {selectedItem.reporter?.email || 'N/A'}</p>
                      <p><span className="font-medium">Phone:</span> {selectedItem.reporter?.phone || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium">Description</h3>
                  <p className="mt-2">{selectedItem.description || 'No description provided'}</p>
                </div>
                
                {selectedItem.claimedBy && (
                  <div>
                    <h3 className="text-lg font-medium">Claim Information</h3>
                    <div className="mt-2 space-y-2">
                      <p><span className="font-medium">Claimed By:</span> {selectedItem.claimedBy.firstName} {selectedItem.claimedBy.lastName}</p>
                      <p><span className="font-medium">Email:</span> {selectedItem.claimedBy.email}</p>
                      <p><span className="font-medium">Phone:</span> {selectedItem.claimedBy.phone}</p>
                      <p><span className="font-medium">Claim Date:</span> {selectedItem.claimedBy.claimedAt ? new Date(selectedItem.claimedBy.claimedAt).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setSelectedItem(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
