import mongoose from 'mongoose';

/**
 * Establishes a connection to MongoDB using Mongoose.
 * Logs success or terminates the process if a connection failure occurs.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    
    // Log the successful connection and host details
    console.log(`[Database] MongoDB Connected Successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database] Error connecting to MongoDB: ${error.message}`);
    // Exit process with failure code if connection fails
    process.exit(1);
  }
};

export default connectDB;
