const AdminItem = require('../models/AdminItem');

// Create a new item
exports.createAdminItem = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      status,
      location,
      date,
      contactInfo
    } = req.body;

    console.log('Received data:', req.body);

    // Validate required fields with specific messages
    const missingFields = [];
    if (!title) missingFields.push('title');
    if (!description) missingFields.push('description');
    if (!category) missingFields.push('category');
    if (!status) missingFields.push('status');
    if (!location) missingFields.push('location');
    if (!contactInfo) missingFields.push('contactInfo');

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(', ')}`,
        required: ['title', 'description', 'category', 'status', 'location', 'contactInfo'],
        missing: missingFields,
        received: req.body
      });
    }

    // Validate contact info with specific messages
    const missingContactInfo = [];
    if (!contactInfo.firstName) missingContactInfo.push('firstName');
    if (!contactInfo.lastName) missingContactInfo.push('lastName');
    if (!contactInfo.email) missingContactInfo.push('email');
    if (!contactInfo.phone) missingContactInfo.push('phone');

    if (missingContactInfo.length > 0) {
      return res.status(400).json({
        message: `Missing required contact information: ${missingContactInfo.join(', ')}`,
        required: ['firstName', 'lastName', 'email', 'phone'],
        missing: missingContactInfo,
        received: contactInfo
      });
    }

    // Validate category enum
    const validCategories = ['Electronics', 'Clothing', 'Documents', 'Accessories', 'Other'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        message: 'Invalid category',
        validCategories,
        received: category
      });
    }

    // Validate status enum
    const validStatuses = ['lost', 'found', 'claimed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid status',
        validStatuses,
        received: status
      });
    }

    const adminItem = new AdminItem({
      title,
      description,
      category,
      status,
      location,
      date: date || new Date(),
      contactInfo,
      addedBy: req.user.userId // Use userId from the decoded token
    });

    await adminItem.save();
    res.status(201).json(adminItem);
  } catch (error) {
    console.error('Error creating admin item:', error);
    res.status(500).json({ 
      message: 'Error creating item', 
      error: error.message,
      stack: error.stack
    });
  }
};

// Get all admin items
exports.getAllAdminItems = async (req, res) => {
  try {
    const items = await AdminItem.find()
      .sort({ createdAt: -1 })
      .populate('addedBy', 'firstName lastName email');
    res.json(items);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching items', 
      error: error.message 
    });
  }
};

// Get admin item by ID
exports.getAdminItemById = async (req, res) => {
  try {
    const item = await AdminItem.findById(req.params.id)
      .populate('addedBy', 'firstName lastName email');
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching item', 
      error: error.message 
    });
  }
};

// Update admin item
exports.updateAdminItem = async (req, res) => {
  try {
    const updates = {};
    const allowedUpdates = ['title', 'description', 'category', 'status', 'location', 'date'];
    
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    if (req.body.firstName || req.body.lastName || req.body.email || req.body.phone) {
      updates.contactInfo = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone
      };
    }

    const item = await AdminItem.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error updating item', 
      error: error.message 
    });
  }
};

// Delete admin item
exports.deleteAdminItem = async (req, res) => {
  try {
    const item = await AdminItem.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error deleting item', 
      error: error.message 
    });
  }
}; 