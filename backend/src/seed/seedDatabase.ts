import mongoose from 'mongoose';
import { connectDB } from '../config/database';
import { Regulation } from '../models/Regulation';
import regulationsData from './regulations.json';
import dotenv from 'dotenv';

dotenv.config();

const seedDatabase = async () => {
  try {
    await connectDB();
    
    // Delete existing
    await Regulation.deleteMany({});
    console.log('Old regulations deleted');
    
    // Insert new
    await Regulation.insertMany(regulationsData.regulations);
    console.log('✅ Regulations seeded successfully');
    
    await mongoose.disconnect();
    console.log('Database disconnected');
  } catch (error) {
    console.error('Seeding failed:', error);
  }
};

seedDatabase();