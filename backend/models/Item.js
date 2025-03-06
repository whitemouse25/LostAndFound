const mongoose = require('mongoose');

const itemSchema = mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      enum: ['Lost', 'Found', 'Claimed'],
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    itemName: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    details: {
      type: String,
      required: false,
    },
    image: {
      type: String,
      required: false,
    },
    claimCode: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;