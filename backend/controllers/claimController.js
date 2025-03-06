const Claim = require('../models/Claim');
const Item = require('../models/Item');

// @desc    Create a new claim
// @route   POST /api/claims
// @access  Public
const createClaim = async (req, res) => {
  try {
    const { firstName, lastName, email, verificationCode } = req.body;

    // Find the item with the matching claim code
    const item = await Item.findOne({ claimCode: verificationCode });

    if (!item) {
      return res.status(404).json({ message: 'Invalid verification code' });
    }

    if (item.status === 'Claimed') {
      return res.status(400).json({ message: 'This item has already been claimed' });
    }

    // Create claim
    const claim = await Claim.create({
      itemId: item._id,
      firstName,
      lastName,
      email,
      verificationCode,
    });

    res.status(201).json(claim);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all claims
// @route   GET /api/claims
// @access  Private
const getClaims = async (req, res) => {
  try {
    const claims = await Claim.find({}).populate('itemId').sort({ createdAt: -1 });
    res.json(claims);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update claim status
// @route   PUT /api/claims/:id
// @access  Private
const updateClaimStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const claim = await Claim.findById(req.params.id);

    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    claim.status = status;
    const updatedClaim = await claim.save();

    // If claim is approved, update the item status to 'Claimed'
    if (status === 'Approved') {
      const item = await Item.findById(claim.itemId);
      if (item) {
        item.status = 'Claimed';
        await item.save();
      }
    }

    res.json(updatedClaim);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { createClaim, getClaims, updateClaimStatus };