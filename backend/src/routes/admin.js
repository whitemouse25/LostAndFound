const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/auth');
const { sendVerificationCode, verifyClaim, getClaimRequests } = require('../controllers/adminController');

// Protected admin routes (require authentication)
router.use(adminAuth);

// Send verification code to user
router.post('/send-verification', sendVerificationCode);

// Verify claim code
router.post('/verify-claim', verifyClaim);

// Get all claim requests
router.get('/claims', getClaimRequests);

module.exports = router; 