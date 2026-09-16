import AuditLog from '../models/AuditLog.model.js';

export const auditLogger = (resource) => {
  return async (req, res, next) => {
    // Intercept response to only log on success
    const originalSend = res.send;
    res.send = function (body) {
      res.send = originalSend;
      
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        let action = 'OTHER';
        if (req.method === 'POST') action = 'CREATE';
        if (req.method === 'PUT' || req.method === 'PATCH') action = 'UPDATE';
        if (req.method === 'DELETE') action = 'DELETE';

        // Don't await to avoid blocking the response
        AuditLog.create({
          action,
          resource,
          resourceId: req.params.id || null,
          user: req.user._id,
          ipAddress: req.ip,
          details: {
            method: req.method,
            path: req.originalUrl,
            query: req.query
            // Don't log full body to avoid sensitive data, or sanitize it
          }
        }).catch(err => console.error('Failed to write audit log:', err));
      }
      
      return res.send(body);
    };
    next();
  };
};
