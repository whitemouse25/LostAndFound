const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dqxvlsrwm',
  api_key: process.env.CLOUDINARY_API_KEY || '944789136612445',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'Ry_Kqf_yGkPfTDlGZOEwh8nqnYk',
});

// Upload file to Cloudinary
exports.uploadToCloudinary = async (filePath) => {
  try {
    // Upload the file
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'lost-and-found',
    });

    // Remove the file from local storage
    fs.unlinkSync(filePath);

    // Return the secure URL
    return result.secure_url;
  } catch (error) {
    // Remove the file from local storage in case of error
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw error;
  }
}; 