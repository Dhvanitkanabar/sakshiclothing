import User from '../models/User.model.js';
import ApiError from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createClerkClient, verifyToken as clerkVerify } from '@clerk/backend';
import { verifyToken as localVerify } from '../utils/tokenHelper.js';
import jwt from 'jsonwebtoken';

// Initialize lazily inside the middleware
let clerkClientInstance = null;
const getClerkClient = () => {
  if (!clerkClientInstance) {
    clerkClientInstance = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
  }
  return clerkClientInstance;
};

const resolveUserFromToken = async (token) => {
  if (!token) return null;

  const decodedUnverified = jwt.decode(token);
  let user = null;
  console.log('Decoded Token ISS:', decodedUnverified?.iss);
  
  if (decodedUnverified && decodedUnverified.iss && decodedUnverified.iss.includes('clerk')) {
    // Clerk Token
    try {
      const verifiedClerk = await clerkVerify(token, { secretKey: process.env.CLERK_SECRET_KEY });
      if (verifiedClerk) {
        user = await User.findOne({ clerkUserId: verifiedClerk.sub });
        
        // JIT Provisioning if user doesn't exist in our DB but authenticated in Clerk
        if (!user) {
          try {
            const client = getClerkClient();
            const clerkUser = await client.users.getUser(verifiedClerk.sub);
            const email = clerkUser.emailAddresses?.[0]?.emailAddress || 'no-email@example.com';
            const firstName = clerkUser.firstName || '';
            const lastName = clerkUser.lastName || '';
            const fullName = `${firstName} ${lastName}`.trim() || 'User';

            user = await User.create({
              clerkUserId: verifiedClerk.sub,
              email: email,
              fullName: fullName,
              role: 'user',
              isActive: true,
              isBlocked: false,
              isEmailVerified: true
            });
            console.log('JIT Provisioned Clerk User:', email);
          } catch (syncErr) {
            require('fs').appendFileSync('clerk_error.log', new Date().toISOString() + ' JIT Error: ' + syncErr.message + '\n');
            console.error('Failed to JIT provision Clerk user:', syncErr.message);
          }
        }
      }
    } catch (err) {
      require('fs').appendFileSync('clerk_error.log', new Date().toISOString() + ' Verification Error: ' + err.message + '\n');
      console.error('Clerk Verification Error:', err.message);
    }
  } else {
    // Local JWT
    const decoded = localVerify(token);
    if (decoded && decoded.id) {
      user = await User.findById(decoded.id);
    }
  }

  return user;
};

export const authenticate = [
  asyncHandler(async (req, res, next) => {
    let token;
    
    if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Access denied. No token provided.');
    }

    const user = await resolveUserFromToken(token);

    if (!user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid token or user no longer exists.');
    }

    if (user.isBlocked) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Your account has been blocked.');
    }

    if (!user.isActive) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Your account is inactive.');
    }

    req.user = user;
    next();
  })
];

export const optionalAuth = [
  asyncHandler(async (req, res, next) => {
    let token;
    
    if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) return next();

    const user = await resolveUserFromToken(token);

    if (user && !user.isBlocked && user.isActive) {
      req.user = user;
    }

    next();
  })
];

export const authenticateRefresh = (req, res, next) => {
  next(new ApiError(HTTP_STATUS.BAD_REQUEST, 'Refresh tokens are not used.'));
};
