const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Item = require('../models/Item');
const { protect, adminAuth } = require('../middleware/auth');
const {
  createItem,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem,
  claimItem,
  searchItems,
  filterItems,
  generateTestQRCode,
  generateQRCode,
} = require('../controllers/itemController');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: './src/uploads/',
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 }, // 10MB limit
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
  }
});

// Check file type
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}

// Public routes
router.post('/', upload.array('images', 5), createItem);
router.get('/', getAllItems);
router.get('/search', searchItems);
router.get('/filter', filterItems);
router.post('/claim', upload.single('qrCode'), claimItem);
router.get('/:id', getItemById);
router.get('/:id/qr-code', generateQRCode);

// Test route for QR code generation
router.get('/test-qr/:itemId', generateTestQRCode);

// Admin routes
router.put('/:id', adminAuth, updateItem);
router.delete('/:id', adminAuth, deleteItem);

module.exports = router; 