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
import brandRouter from './routes/brand.routes.js';
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
import newsletterRouter from './routes/newsletter.routes.js';
import loyaltyRouter from './routes/loyalty.routes.js';
import notificationRouter from './routes/notification.routes.js';
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

// =========================================================================
// Global Middlewares Setup
// =========================================================================

// Set security HTTP headers
app.use(helmet());

// Configure CORS
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

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

// =========================================================================
// Routes Mounting
// =========================================================================

app.use('/api/v1/health', healthRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/brands', brandRouter);
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
app.use('/api/v1/newsletter', newsletterRouter);
app.use('/api/v1/loyalty', loyaltyRouter);
app.use('/api/v1/notifications', notificationRouter);
app.use('/api/v1/payments', paymentRouter);

// =========================================================================
// Fallback Error & Not Found Middlewares
// =========================================================================

app.use(notFound);
app.use(errorHandler);

export default app;
