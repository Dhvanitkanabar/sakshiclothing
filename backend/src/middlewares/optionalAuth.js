import { asyncHandler } from '../utils/asyncHandler.js';
import { verifyToken as clerkVerify, createClerkClient } from '@clerk/backend';
import { verifyToken as localVerify } from '../utils/tokenHelper.js';
import User from '../models/User.model.js';
import jwt from 'jsonwebtoken';

let clerkClientInstance = null;
const getClerkClient = () => {
  if (!clerkClientInstance) {
    clerkClientInstance = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
  }
  return clerkClientInstance;
};

export const optionalAuthenticate = asyncHandler(async (req, res, next) => {
  let token;

  // Check Authorization header first (Clerk Bearer token), then fall back to cookie
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) return next();

  try {
    const decodedUnverified = jwt.decode(token);

    if (decodedUnverified && decodedUnverified.iss && decodedUnverified.iss.includes('clerk')) {
      // Clerk token
      try {
        const verifiedClerk = await clerkVerify(token, { secretKey: process.env.CLERK_SECRET_KEY });
        if (verifiedClerk) {
          let user = await User.findOne({ clerkUserId: verifiedClerk.sub });

          // JIT Provisioning
          if (!user) {
            try {
              const clerkUser = await getClerkClient().users.getUser(verifiedClerk.sub);
              const email = clerkUser.emailAddresses?.[0]?.emailAddress || 'no-email@example.com';
              const firstName = clerkUser.firstName || '';
              const lastName = clerkUser.lastName || '';
              const fullName = `${firstName} ${lastName}`.trim() || 'User';
              user = await User.create({
                clerkUserId: verifiedClerk.sub,
                email,
                fullName,
                role: 'user',
                isActive: true,
                isBlocked: false,
                isEmailVerified: true
              });
              console.log('JIT Provisioned (optionalAuth):', email);
            } catch (syncErr) {
              console.error('JIT provision failed:', syncErr.message);
            }
          }

          if (user && !user.isBlocked && user.isActive) {
            req.user = user;
          }
        }
      } catch (clerkErr) {
        console.error('Clerk optionalAuth error:', clerkErr.message);
      }
    } else {
      // Local JWT
      const decoded = localVerify(token);
      if (decoded && decoded.id) {
        const user = await User.findById(decoded.id);
        if (user && !user.isBlocked && user.isActive) {
          req.user = user;
        }
      }
    }
  } catch {
    // Silently fail — optional auth
  }

  next();
});
