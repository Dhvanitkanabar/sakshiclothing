import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../src/models/User.model.js';
import Category from '../src/models/Category.model.js';
import Brand from '../src/models/Brand.model.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding...');

    // Clear db
    await User.deleteMany();
    await Category.deleteMany();
    await Brand.deleteMany();

    // Create Admin
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@sakshiclothing.com',
      password: hashedPassword,
      role: 'admin',
      isVerified: true
    });

    // Create Customer
    const customerPassword = await bcrypt.hash('customer123', salt);
    await User.create({
      firstName: 'Demo',
      lastName: 'Customer',
      email: 'demo@example.com',
      password: customerPassword,
      role: 'customer',
      isVerified: true
    });

    console.log('Seed data inserted successfully!');
    process.exit();
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
