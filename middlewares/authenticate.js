import jwt from 'jsonwebtoken';
import User from '../models/userSchema.js';

const authenticate = async (req, res, next) => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    console.log("Raw Authorization Header:", authHeader);
    console.log("Extracted Token:", token);

    // If no token is provided
    if (!token) {
      return res.status(401).json({ msg: 'Access denied, no token provided' });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded JWT payload:", decoded);

    // Fetch the user from the database using the decoded ID
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ msg: 'User not found' });
    }

    // Attach the user details to the request object
    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role
    };

    next(); // Proceed to the next middleware/route handler
  } catch (error) {
    console.error('Authentication error:', error.message);
    res.status(401).json({ msg: 'Invalid or expired token' });
  }
};

export default authenticate;