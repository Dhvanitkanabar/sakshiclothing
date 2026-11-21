/**
 * Sakshi Clothing — Fail-Fast Environment Variable Validator
 * Verifies critical infrastructure keys at service boot to prevent runtime payment or auth crashes.
 */
import logger from '../utils/logger.js';

export const validateEnv = () => {
  const isProduction = process.env.NODE_ENV === 'production';

  const requiredVars = [
    { key: 'MONGODB_URI', desc: 'MongoDB Atlas connection string' },
    { key: 'JWT_SECRET', desc: 'Secret key for signing admin and session JWTs' },
  ];

  const paymentVars = [
    { key: 'RAZORPAY_KEY_ID', desc: 'Razorpay API Key ID' },
    { key: 'RAZORPAY_KEY_SECRET', desc: 'Razorpay API Secret' },
    { key: 'RAZORPAY_WEBHOOK_SECRET', desc: 'Razorpay Webhook Verification Secret' },
  ];

  const missingCore = requiredVars.filter(v => !process.env[v.key]);
  const missingPayment = paymentVars.filter(v => !process.env[v.key]);

  if (missingCore.length > 0) {
    const errorMsg = `[CRITICAL BOOT ERROR] Missing mandatory environment variables:\n` +
      missingCore.map(v => `  - ${v.key}: ${v.desc}`).join('\n');
    logger.error(errorMsg);
    
    if (isProduction) {
      console.error(errorMsg);
      process.exit(1);
    } else {
      console.warn(`[DEVELOPMENT WARNING] Some core env vars are missing. Running in degraded dev mode.`);
    }
  }

  if (missingPayment.length > 0) {
    const warnMsg = `[PAYMENT CONFIG WARNING] Missing Razorpay variables (Checkout will run in simulated mode):\n` +
      missingPayment.map(v => `  - ${v.key}: ${v.desc}`).join('\n');
    if (isProduction) {
      logger.error(`[CRITICAL] Production deployment missing live payment keys!`);
      console.error(warnMsg);
      process.exit(1);
    } else {
      logger.warn(warnMsg);
    }
  }

  logger.info(`[ENV VALIDATOR] Environment validation completed for mode: ${process.env.NODE_ENV || 'development'}`);
  return true;
};

export default validateEnv;
