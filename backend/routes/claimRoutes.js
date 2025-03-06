const express = require('express');
const router = express.Router();
const {
  createClaim,
  getClaims,
  updateClaimStatus,
} = require('../controllers/claimController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', createClaim);
router.get('/', protect, getClaims);
router.put('/:id', protect, updateClaimStatus);

module.exports = router;