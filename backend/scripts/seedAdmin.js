const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('../models/Admin');
const connectDB = require('../config/db');

dotenv.config();

connectDB();

const seedAdmin = async () => {
  try {
    // Clear existing admins
    await Admin.deleteMany();

    // Create admin
    await Admin.create({
      email: 'admin@fanshawe.ca',
      password: 'admin123',
    });

    console.log('Admin user seeded!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();