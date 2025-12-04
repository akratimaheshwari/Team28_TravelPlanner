const jwt = require('jsonwebtoken');
const User = require('../models/User');


exports.verifyToken = async (req, res, next) => {
try {
const header = req.headers.authorization;
if (!header) return res.status(401).json({ message: 'Unauthorized' });
const token = header.split(' ')[1];
const payload = jwt.verify(token, process.env.JWT_SECRET);
const user = await User.findById(payload.id).select('-password');
if (!user) return res.status(401).json({ message: 'Unauthorized' });
req.user = user;
next();
} catch (err) { next(err); }
};