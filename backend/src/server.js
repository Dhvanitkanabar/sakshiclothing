import dns from 'dns';
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

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

    // Auto-seed default luxury categories & subcategories if DB has <= 3 categories
    try {
      const CategoryService = (await import('./services/category.service.js')).default;
      const Category = (await import('./models/Category.model.js')).default;
      const catCount = await Category.countDocuments();
      if (catCount <= 3) {
        logger.info(`[Server] Detected ${catCount} categories, auto-seeding standard luxury categories and subcategories...`);
        await CategoryService.seedDefaultCategories();
        logger.info('[Server] Standard categories and subcategories auto-seeded successfully.');
      }
    } catch (seedErr) {
      logger.warn(`[Server] Auto-seed notice: ${seedErr.message}`);
    }

    // 2. Start listening on the specified port

    const server = app.listen(PORT, '0.0.0.0', () => {
      logger.info(`[Server] E-Commerce server running on port: ${PORT}`);
      logger.info(`[Server] Mode: ${process.env.NODE_ENV}`);
      logger.info(`[Server] Health check target: http://0.0.0.0:${PORT}/health`);

      // Prevent Render instance from sleeping: Self-ping heartbeat every 10 minutes
      const keepAliveUrl = process.env.RENDER_EXTERNAL_URL 
        ? `${process.env.RENDER_EXTERNAL_URL}/health` 
        : 'https://sakshi-clothing-backend.onrender.com/health';
      setInterval(() => {
        fetch(keepAliveUrl)
          .then(r => logger.info(`[KeepAlive Heartbeat] Pinged ${keepAliveUrl} -> status ${r.status}`))
          .catch(err => logger.warn(`[KeepAlive Heartbeat] Ping error: ${err.message}`));
      }, 10 * 60 * 1000);
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
