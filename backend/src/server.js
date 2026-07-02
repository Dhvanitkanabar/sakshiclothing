import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './config/database.js';
import logger from './utils/logger.js';

// Load environment configurations before initiating database connection
dotenv.config();

const PORT = process.env.PORT || 5000;

// Handle Uncaught Exceptions globally
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  if (logger && logger.error) {
    logger.error(`${err.name}: ${err.message}`);
    logger.error(err.stack);
  } else {
    console.error(err);
  }
  process.exit(1);
});

const startServer = async () => {
  try {
    // 1. Await successful connection to MongoDB
    logger.info('[Server] Connecting to MongoDB...');
    await connectDB();

    // 2. Start listening on the specified port
    const server = app.listen(PORT, () => {
      logger.info(`[Server] E-Commerce server running on port: ${PORT}`);
      logger.info(`[Server] Mode: ${process.env.NODE_ENV}`);
      logger.info(`[Server] Health check target: http://localhost:${PORT}/api/health`);
    });

    // Handle Unhandled Rejections
    process.on('unhandledRejection', (err) => {
      logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
      logger.error(`${err.name}: ${err.message}`);
      server.close(() => {
        process.exit(1);
      });
    });
    
    // Graceful Shutdown for SIGTERM
    process.on('SIGTERM', () => {
      logger.info('SIGTERM RECEIVED. Shutting down gracefully');
      server.close(() => {
        logger.info('Process terminated!');
      });
    });

  } catch (error) {
    if (logger && logger.error) {
      logger.error(`[Server] Bootstrapping failed to launch server: ${error.message}`);
    } else {
      console.error(`[Server] Bootstrapping failed: ${error.message}`);
    }
    process.exit(1);
  }
};

startServer();
