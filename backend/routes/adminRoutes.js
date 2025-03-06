const express = require('express');
const router = express.Router();
const {
  loginAdmin,
  registerAdmin,
  getAdminProfile,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', loginAdmin);
router.post('/register', registerAdmin);
router.get('/profile', protect, getAdminProfile);

module.exports = router;