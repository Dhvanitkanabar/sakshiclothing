import mongoose from 'mongoose';

/**
 * Controller to handle Server Health Check requests.
 * @route GET /health and /api/v1/health
 * @desc Checks if backend server, database, and process are healthy
 * @access Public
 */
export const checkHealth = (req, res, next) => {
  try {
    const isMongoConnected = mongoose.connection.readyState === 1;
    const mongoStatusMap = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };

    const memoryUsage = process.memoryUsage();

    const healthData = {
      success: isMongoConnected,
      status: isMongoConnected ? 'healthy' : 'degraded',
      service: 'Sakshi Clothing API',
      version: process.env.npm_package_version || '1.0.0',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      database: {
        status: mongoStatusMap[mongoose.connection.readyState] || 'unknown',
        host: mongoose.connection.host || 'remote',
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        rssMemoryMb: Math.round(memoryUsage.rss / 1024 / 1024),
        heapUsedMb: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      },
    };

    const statusCode = isMongoConnected ? 200 : 503;
    return res.status(statusCode).json(healthData);
  } catch (error) {
    next(error);
  }
};
