const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

/**
 * Tests the claim process with a sample QR code
 * @param {string} itemId - The MongoDB item ID to include in the QR code
 * @param {string} baseUrl - The base URL of the API
 * @returns {Promise<Object>} - The response from the claim endpoint
 */
const testClaim = async (itemId, baseUrl = 'http://localhost:5000/api') => {
  try {
    // Generate a test QR code file
    const { generateTestQRCode } = require('./testQRCode');
    const qrCodePath = generateTestQRCode(itemId);
    
    // Create a FormData object
    const formData = new FormData();
    formData.append('firstName', 'Test');
    formData.append('lastName', 'User');
    formData.append('email', 'test@example.com');
    formData.append('phone', '1234567890');
    
    // Append the QR code file
    formData.append('qrCode', fs.createReadStream(qrCodePath));
    
    // Send the request
    const response = await axios.post(`${baseUrl}/items/claim`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });
    
    console.log('Claim test response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Claim test error:', error.response?.data || error.message);
    throw error;
  }
};

module.exports = { testClaim }; 