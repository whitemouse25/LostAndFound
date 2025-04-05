import api from '../api/config';
import { isAdminAuthenticated } from './authService';
import axios from 'axios';

// Create a new public report
export const createPublicReport = async (itemData) => {
  try {
    // Create FormData object for file uploads
    const formData = new FormData();
    
    // Add text fields
    formData.append('title', itemData.title || '');
    formData.append('description', itemData.detailedInfo || '');
    formData.append('category', itemData.category || '');
    formData.append('status', itemData.status || 'lost');
    formData.append('location', itemData.location || '');
    formData.append('date', itemData.date || new Date().toISOString());
    formData.append('firstName', itemData.firstName || '');
    formData.append('lastName', itemData.lastName || '');
    formData.append('email', itemData.email || '');
    formData.append('phone', itemData.phone || '');

    // Add images if they exist
    if (itemData.images && itemData.images.length > 0) {
      itemData.images.forEach((image, index) => {
        formData.append('images', image);
      });
    }

    // Log the form data for debugging
    console.log('Submitting form data:', Object.fromEntries(formData));

    const response = await api.post('/items', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Create Report Error:', {
      error,
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw new Error(error.response?.data?.message || 'Error creating report');
  }
};

// Create a new item
export const createItem = async (itemData) => {
  try {
    // If itemData is FormData, it's already properly formatted
    if (itemData instanceof FormData) {
      // Log the form data for debugging
      const formDataObj = {};
      for (let [key, value] of itemData.entries()) {
        formDataObj[key] = value;
      }
      console.log('Sending form data:', formDataObj);

      const response = await api.post('/items', itemData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    }

    // Validate required fields for regular JSON data
    if (!itemData.title || !itemData.category || !itemData.location || 
        !itemData.firstName || !itemData.lastName || 
        !itemData.email || !itemData.phone) {
      throw new Error('Missing required fields');
    }

    // Create FormData for the request
    const formData = new FormData();
    formData.append('title', itemData.title.trim());
    formData.append('description', (itemData.description || itemData.detailedInfo || 'No description provided').trim());
    formData.append('category', itemData.category);
    formData.append('status', itemData.status || 'found');
    formData.append('location', itemData.location.trim());
    formData.append('date', itemData.date || new Date().toISOString());
    formData.append('firstName', itemData.firstName.trim());
    formData.append('lastName', itemData.lastName.trim());
    formData.append('email', itemData.email.trim());
    formData.append('phone', itemData.phone.trim());

    // Add images if they exist
    if (itemData.images && itemData.images.length > 0) {
      itemData.images.forEach((image) => {
        formData.append('images', image);
      });
    }

    // Validate category enum
    const validCategories = ['Electronics', 'Clothing', 'Documents', 'Accessories', 'Other'];
    if (!validCategories.includes(itemData.category)) {
      throw new Error('Invalid category');
    }

    // Validate status enum
    const validStatuses = ['lost', 'found', 'claimed', 'pending', 'rejected'];
    if (itemData.status && !validStatuses.includes(itemData.status)) {
      throw new Error('Invalid status');
    }

    // Log the form data for debugging
    const formDataObj = {};
    for (let [key, value] of formData.entries()) {
      formDataObj[key] = value;
    }
    console.log('Sending form data:', formDataObj);

    const response = await api.post('/items', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating item:', error);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    } else {
      throw new Error(error.message || 'Failed to create item');
    }
  }
};

// Get all items (admin or public)
export const getAllItems = async () => {
  try {
    // Fetch both user-reported and admin items
    const [publicItems, adminItems] = await Promise.all([
      api.get('/items'),
      api.get('/admin/items')
    ]);

    // Combine and sort all items by date
    const allItems = [...publicItems.data, ...adminItems.data].sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return allItems;
  } catch (error) {
    console.error('Error fetching items:', error);
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/admin/login';
    }
    throw new Error('Failed to fetch items');
  }
};

// Get item by ID (both public and admin)
export const getItemById = async (id, isAdmin = false) => {
  try {
    const endpoint = isAdmin ? `/admin/items/${id}` : `/items/${id}`;
    const response = await api.get(endpoint);
    return response.data;
  } catch (error) {
    console.error('Get Item Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Error fetching item');
  }
};

// Update an item
export const updateItem = async (id, data) => {
  try {
    // First try to update through admin endpoint
    try {
      const response = await api.put(`/admin/items/${id}`, data);
      return response.data;
    } catch (adminError) {
      // If admin endpoint fails with 404, try the public items endpoint
      if (adminError.response?.status === 404) {
        const response = await api.put(`/items/${id}`, data);
        return response.data;
      }
      throw adminError; // Re-throw if it's not a 404 error
    }
  } catch (error) {
    console.error('Error updating item:', error);
    if (error.response?.status === 404) {
      throw new Error('Item not found');
    }
    throw error;
  }
};

// Delete an item
export const deleteItem = async (id) => {
  try {
    if (!isAdminAuthenticated()) {
      throw new Error('Admin authentication required');
    }

    // Use the items endpoint for deletion
    const response = await api.delete(`/items/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting item:', error);
    throw new Error(error.response?.data?.message || 'Failed to delete item');
  }
};

// Claim an item
export const claimItem = async (formData) => {
  try {
    console.log('Submitting claim with data:', {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      itemId: formData.itemId
    });

    const response = await api.post('/items/claim', formData);
    
    console.log('Claim response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Claim Item Error:', error.response?.data || error);
    throw new Error(error.response?.data?.message || 'Error submitting claim');
  }
};

// Public routes
export const searchItems = async (query) => {
  try {
    const response = await api.get('/items/search', {
      params: { query }
    });
    return response.data;
  } catch (error) {
    console.error('Search Items Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Error searching items');
  }
};

export const filterItems = async (filters) => {
  try {
    const response = await api.get('/items/filter', {
      params: filters
    });
    return response.data;
  } catch (error) {
    console.error('Filter Items Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Error filtering items');
  }
};

// Get item statistics
export const getItemStats = async () => {
  try {
    const items = await getAllItems(true);
    return {
      total: items.length,
      lost: items.filter(item => item.status === 'lost').length,
      found: items.filter(item => item.status === 'found').length,
      claimed: items.filter(item => item.status === 'claimed').length,
      returned: items.filter(item => item.status === 'returned').length
    };
  } catch (error) {
    console.error('Get Stats Error:', error);
    throw new Error('Error fetching statistics');
  }
};

// Send verification email
export const sendVerificationEmail = async (email) => {
  try {
    const response = await api.post('/auth/send-verification', { email });
    return response.data;
  } catch (error) {
    console.error('Send Verification Error:', error);
    throw new Error(error.response?.data?.message || 'Error sending verification email');
  }
};

// Verify email code
export const verifyEmail = async (email, code) => {
  try {
    const response = await api.post('/auth/verify-email', { email, code });
    return response.data;
  } catch (error) {
    console.error('Verify Email Error:', error);
    throw new Error(error.response?.data?.message || 'Error verifying email');
  }
};

// Admin sends verification email to user who reported item
export const adminSendVerificationEmail = async (itemId, email) => {
  try {
    const response = await api.post('/admin/send-verification', { itemId, email });
    return response.data;
  } catch (error) {
    console.error('Admin Send Verification Error:', error);
    throw new Error(error.response?.data?.message || 'Error sending verification email');
  }
};

// Admin verifies QR code
export const adminVerifyQRCode = async (qrData) => {
  try {
    const response = await api.post('/admin/verify-claim', { qrData });
    return response.data;
  } catch (error) {
    console.error('Admin Verify QR Error:', error);
    throw new Error(error.response?.data?.message || 'Error verifying QR code');
  }
};

// Generate QR code for item
export const generateQRCode = async (itemId) => {
  try {
    const response = await api.get(`/items/${itemId}/qr-code`);
    return response.data;
  } catch (error) {
    console.error('Generate QR Code Error:', error.response?.data || error);
    throw error;
  }
};

// Get all claim requests (admin only)
export const getClaimRequests = async () => {
  try {
    const response = await api.get('/admin/claims');
    return response.data;
  } catch (error) {
    console.error('Error fetching claim requests:', error);
    throw new Error(error.response?.data?.message || 'Error fetching claim requests');
  }
}; 