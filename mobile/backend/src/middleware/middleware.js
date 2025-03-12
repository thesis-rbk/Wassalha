const jwt = require('jsonwebtoken');
const prisma = require('../../prisma/index');

const authenticateUser = async (req, res, next) => {
  console.log("req.headers", req.headers);
  try {
    // 1. Get token from headers
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Find user in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { profile: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    console.log("user", user);
    // 4. Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ 
      error: 'Invalid or expired token',
      message: error.message
    });
  }
};

const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied. Admins only.' });
    }

    req.user = user; // Attach user to request object
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ 
      error: 'Invalid or expired token',
      message: error.message
    });
  }
};

const authenticateUserOrAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Authentication token is missing' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

module.exports = {
  authenticateUser,
  authenticateAdmin,
  authenticateUserOrAdmin
};
