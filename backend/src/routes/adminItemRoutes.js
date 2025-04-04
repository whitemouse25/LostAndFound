const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/auth');
const {
  createAdminItem,
  getAllAdminItems,
  getAdminItemById,
  updateAdminItem,
  deleteAdminItem
} = require('../controllers/adminItemController');

// All routes are protected with adminAuth middleware
router.use(adminAuth);

// Admin item routes
router.post('/', createAdminItem);
router.get('/', getAllAdminItems);
router.get('/:id', getAdminItemById);
router.put('/:id', updateAdminItem);
router.delete('/:id', deleteAdminItem);

module.exports = router; 