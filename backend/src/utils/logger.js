import winston from 'winston';

/**
 * Custom winston filter to redact sensitive credentials, tokens, and payment secrets
 */
const maskSensitiveData = winston.format((info) => {
  const sensitiveKeywords = [
    'password',
    'token',
    'authorization',
    'secret',
    'cvv',
    'cardnumber',
    'creditcard',
    'razorpay_signature',
    'apikey',
    'cookie'
  ];

  const sanitizeObject = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(sanitizeObject);
    const clean = { ...obj };
    for (const key of Object.keys(clean)) {
      if (sensitiveKeywords.some((s) => key.toLowerCase().includes(s))) {
        clean[key] = '[REDACTED]';
      } else if (typeof clean[key] === 'object') {
        clean[key] = sanitizeObject(clean[key]);
      }
    }
    return clean;
  };

  if (typeof info.message === 'string') {
    info.message = info.message.replace(/(Bearer\s+)[A-Za-z0-9-_=.]+/gi, '$1[REDACTED]');
  } else if (typeof info.message === 'object') {
    info.message = sanitizeObject(info.message);
  }

  return info;
});

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    maskSensitiveData(),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'sakshi-clothing-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({ format: 'HH:mm:ss' }),
      maskSensitiveData(),
      winston.format.printf(({ level, message, timestamp, stack }) => {
        return `${timestamp} ${level}: ${stack || (typeof message === 'object' ? JSON.stringify(message) : message)}`;
      })
    )
  }));
}

export default logger;
