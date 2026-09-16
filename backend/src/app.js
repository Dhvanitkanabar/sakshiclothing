import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import xss from 'xss';
import dotenv from 'dotenv';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// Import Custom Middlewares
import notFound from './middlewares/notFound.js';
import errorHandler from './middlewares/errorHandler.js';
import { requestLogger } from './middlewares/requestLogger.js';

// Import Route Handlers
import healthRouter from './routes/health.routes.js';
import authRouter from './routes/auth.routes.js';
import productRouter from './routes/product.routes.js';
import categoryRouter from './routes/category.routes.js';

import cmsRouter from './routes/cms.routes.js';
import orderRouter from './routes/order.routes.js';
import reviewRouter from './routes/review.routes.js';
import cartRouter from './routes/cart.routes.js';
import wishlistRouter from './routes/wishlist.routes.js';
import dashboardRouter from './routes/dashboard.routes.js';
import uploadRouter from './routes/upload.routes.js';
import addressRouter from './routes/address.routes.js';
import userRouter from './routes/user.routes.js';
import searchRouter from './routes/search.routes.js';
import couponRouter from './routes/coupon.routes.js';

import paymentRouter from './routes/payment.routes.js';

// Initialize dotenv in application scope
dotenv.config();

const app = express();

// =========================================================================
// Swagger Configuration
// =========================================================================
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Sakshi Clothing API',
      version: '1.0.0',
      description: 'API documentation for Sakshi Clothing E-commerce Platform',
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token',
        },
      },
    },
    security: [{ cookieAuth: [] }],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

import rateLimit from 'express-rate-limit';

// =========================================================================
// Global Middlewares Setup
// =========================================================================

// Set security HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://js.stripe.com", "https://checkout.razorpay.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      connectSrc: ["'self'", "https://api.stripe.com", "https://api.razorpay.com", "https://clerk.com", "https://*.clerk.accounts.dev"],
      frameSrc: ["'self'", "https://js.stripe.com", "https://checkout.razorpay.com"]
    }
  }
}));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 1000, // Limit each IP to 1000 requests per `window`
  standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use('/api/', apiLimiter);

// Configure CORS dynamically for Production & Staging
const allowedOriginsList = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(url => url.trim())
  : [
      process.env.CLIENT_URL,
      process.env.ADMIN_URL,
      'http://localhost:5173',
      'http://localhost:3001'
    ].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOriginsList.includes(origin) || allowedOriginsList.includes('*')) {
      callback(null, true);
    } else {
      callback(null, true); // Fallback allow dynamically
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

import webhookRouter from './routes/webhook.routes.js';
// Mount webhooks before express.json to parse raw body
app.use('/api/v1/webhooks', webhookRouter);

// Stripe and Razorpay require the raw body for signature verification.
// We'll capture it in `req.rawBody` before express.json() parses it.
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Custom XSS protection middleware using xss
app.use((req, res, next) => {
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = xss(req.body[key]);
      }
    }
  }
  next();
});

// Prevent parameter pollution
app.use(hpp());

// Compression
app.use(compression());

// Request logging
app.use(requestLogger);

// Static files and temporary uploads folders setup
app.use('/uploads', express.static('uploads'));

import { clerkMiddleware } from '@clerk/express';

// =========================================================================
// Routes Mounting
// =========================================================================

app.use(clerkMiddleware());

app.use('/api/v1/health', healthRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/categories', categoryRouter);

app.use('/api/v1/cms', cmsRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/cart', cartRouter);
app.use('/api/v1/wishlist', wishlistRouter);
app.use('/api/v1/dashboard', dashboardRouter);
app.use('/api/v1/uploads', uploadRouter);
app.use('/api/v1/addresses', addressRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/search', searchRouter);
app.use('/api/v1/coupons', couponRouter);

app.use('/api/v1/payments', paymentRouter);

// =========================================================================
// Fallback Error & Not Found Middlewares
// =========================================================================

app.use(notFound);
app.use(errorHandler);

export default app;
