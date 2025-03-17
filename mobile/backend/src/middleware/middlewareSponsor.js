const jwt = require('jsonwebtoken');
const prisma = require('../../prisma/index');

const uerSPONSOR = async (req, res, next) => {
    console.log("req.headers", req.headers);
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.serviceProvider.findUnique({
            where: { userId: decoded.id },
        });
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }
        console.log("user", user);
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
module.exports = {
    uerSPONSOR
}
