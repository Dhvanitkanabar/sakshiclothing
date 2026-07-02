// Compatibility shim — re-exports the actual authentication/authorization middleware
// under the names used by order/address routes.

export { authenticate as verifyJWT } from './authentication.js';
export { authorize as authorizeRoles } from './authorize.js';
