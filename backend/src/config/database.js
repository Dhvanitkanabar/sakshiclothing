import mongoose from 'mongoose';
import logger from '../utils/logger.js';

const connectDB = async () => {
  const MAX_RETRIES = 3;
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI);
      logger.info(`[Database] MongoDB Connected Successfully: ${conn.connection.host}`);
      
      // Handle connection events after initial connection
      mongoose.connection.on('disconnected', () => {
        logger.warn('[Database] MongoDB disconnected');
      });
      
      mongoose.connection.on('error', (err) => {
        logger.error(`[Database] MongoDB error: ${err.message}`);
      });
      
      return conn;
    } catch (error) {
      retries += 1;
      logger.error(`[Database] Error connecting to MongoDB (Attempt ${retries}/${MAX_RETRIES}): ${error.message}`);
      
      if (retries === MAX_RETRIES) {
        logger.error('[Database] Max retries reached. Exiting...');
        process.exit(1);
      }
      // Wait for 5 seconds before retrying
      await new Promise(res => setTimeout(res, 5000));
    }
  }
};

export default connectDB;
