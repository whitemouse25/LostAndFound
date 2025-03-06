const Item = require('../models/Item');
const crypto = require('crypto');

// Generate a random claim code
const generateClaimCode = () => {
  return crypto.randomBytes(3).toString('hex').toUpperCase();
};

// @desc    Create a new item
// @route   POST /api/items
// @access  Public
const createItem = async (req, res) => {
  try {
    const {
      status,
      firstName,
      lastName,
      email,
      phone,
      itemName,
      location,
      date,
      details,
    } = req.body;

    // Generate claim code for found items
    const claimCode = status === 'Found' ? generateClaimCode() : null;

    // Create item
    const item = await Item.create({
      status,
      firstName,
      lastName,
      email,
      phone,
      itemName,
      location,
      date: new Date(date),
      details,
      image: req.file ? `/uploads/${req.file.filename}` : null,
      claimCode,
    });

    res.status(201).json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all items
// @route   GET /api/items
// @access  Private
const getItems = async (req, res) => {
  try {
    const items = await Item.find({}).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get item by ID
// @route   GET /api/items/:id
// @access  Private
const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (item) {
      res.json(item);
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update item
// @route   PUT /api/items/:id
// @access  Private
const updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (item) {
      item.status = req.body.status || item.status;
      item.firstName = req.body.firstName || item.firstName;
      item.lastName = req.body.lastName || item.lastName;
      item.email = req.body.email || item.email;
      item.phone = req.body.phone || item.phone;
      item.itemName = req.body.itemName || item.itemName;
      item.location = req.body.location || item.location;
      item.date = req.body.date ? new Date(req.body.date) : item.date;
      item.details = req.body.details || item.details;
      
      if (req.file) {
        item.image = `/uploads/${req.file.filename}`;
      }

      const updatedItem = await item.save();
      res.json(updatedItem);
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete item
// @route   DELETE /api/items/:id
// @access  Private
const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (item) {
      await item.remove();
      res.json({ message: 'Item removed' });
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get items by status
// @route   GET /api/items/status/:status
// @access  Public
const getItemsByStatus = async (req, res) => {
  try {
    const items = await Item.find({ status: req.params.status }).sort({
      createdAt: -1,
    });
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
  getItemsByStatus,
};