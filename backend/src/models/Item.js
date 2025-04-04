const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Electronics', 'Clothing', 'Documents', 'Accessories', 'Other']
  },
  status: {
    type: String,
    required: true,
    enum: ['lost', 'found', 'claimed'],
    default: 'found'
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  images: [{
    type: String,
    required: true
  }],
  reporter: {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    }
  },
  claimedBy: {
    firstName: {
      type: String,
      trim: true
    },
    lastName: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true
    },
    phoneNumber: {
      type: String,
      trim: true
    },
    qrCodeImage: {
      type: String // URL to the stored QR code image
    },
    claimedAt: {
      type: Date
    }
  }
}, {
  timestamps: true
});

// Update the updatedAt timestamp before saving
itemSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Item', itemSchema); 