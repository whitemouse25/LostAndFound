const fs = require('fs');
const path = require('path');

/**
 * Generates a test QR code file with a sample item ID
 * @param {string} itemId - The MongoDB item ID to include in the QR code
 * @returns {string} - Path to the generated QR code file
 */
const generateTestQRCode = (itemId) => {
  // Create a more detailed QR code content
  const qrContent = `
LOST AND FOUND ITEM VERIFICATION
--------------------------------
Item ID: ${itemId}
Date: ${new Date().toISOString()}
--------------------------------
This is a test QR code for the Lost and Found application.
Please use this QR code to claim your item.
  `;
  
  const filePath = path.join(__dirname, '../../uploads', `test-qr-${Date.now()}.txt`);
  
  // Ensure the uploads directory exists
  const uploadsDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  // Write the QR code content to a file
  fs.writeFileSync(filePath, qrContent);
  
  console.log(`Test QR code generated at: ${filePath}`);
  console.log('QR code content:', qrContent);
  return filePath;
};

module.exports = { generateTestQRCode }; 