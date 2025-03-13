// Export the middleware functions as an object
const adminMiddleware = {
  roleCheck: (roles) => {
    return (req, res, next) => {
      if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ 
          success: false, 
          message: "Access denied. Insufficient permissions." 
        });
      }
      next();
    };
  }
};

module.exports = adminMiddleware;
