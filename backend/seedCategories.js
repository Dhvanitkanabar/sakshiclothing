import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './src/models/Category.model.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sakshi-clothing';

const seedCategories = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const categories = [
      {
        name: 'Clothing',
        slug: 'clothing',
        description: 'All types of clothing',
        isActive: true,
      },
      {
        name: 'Jewellery',
        slug: 'jewellery',
        description: 'Artificial and imitation jewellery',
        isActive: true,
      },
      {
        name: 'Accessories',
        slug: 'accessories',
        description: 'Bags, belts, and other accessories',
        isActive: true,
      },
      {
        name: 'Footwear',
        slug: 'footwear',
        description: 'Shoes, sandals, and more',
        isActive: true,
      }
    ];

    for (const cat of categories) {
      const exists = await Category.findOne({ slug: cat.slug });
      if (!exists) {
        await Category.create(cat);
        console.log(`Created category: ${cat.name}`);
      } else {
        console.log(`Category already exists: ${cat.name}`);
      }
    }

    console.log('Categories seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
};

seedCategories();
