const Item = require('../models/Item');
const { uploadToCloudinary } = require('../utils/cloudinary');
const fs = require('fs').promises;


const QRCodeReader = require('qrcode-reader');
const Jimp = require('jimp'); // You need to install Jimp for image manipulation


// Create a new item
exports.createItem = async (req, res) => {
  try {
    console.log('Received request body:', req.body);
    console.log('Received files:', req.files);

    const {
      title,
      description,
      category,
      status,
      location,
      date,
      firstName,
      lastName,
      email,
      phone,
      detailedInfo,
    } = req.body;

    // Validate required fields
    if (!title || !category || !location || !firstName || !lastName || !email || !phone) {
      const missingFields = [];
      if (!title) missingFields.push('title');
      if (!category) missingFields.push('category');
      if (!location) missingFields.push('location');
      if (!firstName) missingFields.push('firstName');
      if (!lastName) missingFields.push('lastName');
      if (!email) missingFields.push('email');
      if (!phone) missingFields.push('phone');

      return res.status(400).json({
        message: 'Missing required fields',
        missingFields,
        details: `Please provide all required fields: ${missingFields.join(', ')}`
      });
    }

    // Validate category
    const validCategories = ['Electronics', 'Clothing', 'Documents', 'Accessories', 'Other'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        message: 'Invalid category',
        details: `Category must be one of: ${validCategories.join(', ')}`
      });
    }

    // Validate status
    const validStatuses = ['lost', 'found', 'claimed', 'pending', 'rejected'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid status',
        details: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Handle image uploads
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      try {
        const uploadPromises = req.files.map(file => uploadToCloudinary(file.path));
        imageUrls = await Promise.all(uploadPromises);
      } catch (uploadError) {
        console.error('Error uploading images:', uploadError);
        // Continue without images if upload fails
        imageUrls = [];
      }
    }

    // Create the item
    const item = new Item({
      title: title.trim(),
      description: (description || detailedInfo || 'No description provided').trim(),
      category,
      status: status || 'found',
      location: location.trim(),
      date: date ? new Date(date) : new Date(),
      images: imageUrls,
      reporter: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
      },
    });

    await item.save();
    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ 
      message: 'Error creating item', 
      error: error.message,
      details: error.errors ? Object.values(error.errors).map(err => err.message) : []
    });
  }
};

// Get all items
exports.getAllItems = async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching items', error: error.message });
  }
};

// Get item by ID
exports.getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching item', error: error.message });
  }
};

// Update item
exports.updateItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Error updating item', error: error.message });
  }
};

// Delete item
exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting item', error: error.message });
  }
};

// Claim an item
exports.claimItem = async (req, res) => {
    try {
        const { itemId, firstName, lastName, email, phone } = req.body;

        // Validate required fields
        if (!itemId || !firstName || !lastName || !email || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields',
                details: 'Please provide item ID and all contact information'
            });
        }

        // Find the item
        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found',
                details: 'The item ID provided could not be found'
            });
        }

        // Check if item is already claimed or pending
        if (item.status === 'claimed' || item.status === 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Item already claimed',
                details: 'This item has already been claimed by someone else'
            });
        }

        // Update item with claim details and set status to pending
        item.status = 'pending';
        item.claimedBy = {
            firstName,
            lastName,
            email,
            phone,
            claimedAt: new Date()
        };

        // Save the item without updating reporter information
        await item.save({ validateBeforeSave: false });

        res.json({
            success: true,
            message: 'Claim request submitted successfully',
            data: {
                itemId: item._id,
                title: item.title,
                status: item.status,
                claimedBy: item.claimedBy
            }
        });
    } catch (error) {
        console.error('Error processing claim:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing claim',
            details: error.message
        });
    }
};

// Search items
exports.searchItems = async (req, res) => {
  try {
    const { query } = req.query;
    const items = await Item.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
        { location: { $regex: query, $options: 'i' } },
      ],
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Error searching items', error: error.message });
  }
};

// Filter items
exports.filterItems = async (req, res) => {
  try {
    const filters = {};
    if (req.query.category) filters.category = req.query.category;
    if (req.query.status) filters.status = req.query.status;
    if (req.query.location) filters.location = req.query.location;

    const items = await Item.find(filters);
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Error filtering items', error: error.message });
  }
};

// Test endpoint to generate a QR code
exports.generateTestQRCode = async (req, res) => {
  try {
    const { itemId } = req.params;
    
    if (!itemId) {
      return res.status(400).json({ message: 'Item ID is required' });
    }
    
    // Generate a test QR code file
    const { generateTestQRCode } = require('../utils/testQRCode');
    const qrCodePath = generateTestQRCode(itemId);
    
    // Read the file content
    const qrContent = await fs.promises.readFile(qrCodePath, 'utf8');
    
    res.json({
      success: true,
      message: 'Test QR code generated successfully',
      qrCodePath,
      qrContent
    });
  } catch (error) {
    console.error('Error generating test QR code:', error);
    res.status(500).json({ 
      message: 'Error generating test QR code', 
      error: error.message 
    });
  }
};

// Generate QR code for item
exports.generateQRCode = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Item.findById(id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Create a structured QR code content
    const qrContent = `
LOST AND FOUND ITEM VERIFICATION
--------------------------------
Item ID: ${item._id}
Title: ${item.title}
Category: ${item.category}
Date: ${new Date().toISOString()}
--------------------------------
This QR code is required to claim this item.
Please keep this QR code secure.
    `;
    
    // Generate QR code
    const qrCode = await QRCode.toDataURL(qrContent);
    
    res.json({
      success: true,
      qrCode,
      qrContent
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ 
      message: 'Error generating QR code', 
      error: error.message 
    });
  }
}; 