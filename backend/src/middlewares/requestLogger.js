import morgan from 'morgan';
import logger from '../utils/logger.js';

// Setup Morgan to stream logs to Winston
export const requestLogger = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  }
);
