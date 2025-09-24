import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/userSchema.js';
import { v2 as cloudinary } from 'cloudinary';

// Load environment variables
dotenv.config();

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Register Controller

export const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const file = req.file; // from multer middleware

    if (!username || !email || !password || !role || !file) {
      return res.status(400).json({ msg: 'All fields including photo are required' });
    }

    // Restrict admin registration
    const allowedAdminEmails = [
      'akshit.nannaware@cdgi.edu.in',
      'aman.sadiwal@cdgi.edu.in',
      'aksita.ramayane@cdgi.edu.in',
      'admin4@example.com',
    ];

    if (role === 'admin' && !allowedAdminEmails.includes(email)) {
      return res.status(403).json({ msg: 'Only authorized users can register as admins.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Upload photo to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(file.path, {
      folder: 'users',
    });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      role,
      photo: uploadResult.secure_url, // Save Cloudinary image URL
    });

    await user.save();

    res.status(201).json({ msg: 'User registered successfully' });
  } catch (error) {
    console.error('Error during registration:', error.message);
    res.status(500).json({ msg: 'Registration failed' });
  }
};


// Login Controller

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Received email:", email); // Debug log

    // Check if user exists
    // const user = await User.findOne({ email, role: 'email' });
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ msg: 'password do not match' });
    }

    // Generate JWT token
    const token = jwt.sign(
      // //  { ownerId: user.email },
      //  { id: user._id, role: user.role },
      {
        id: user._id,       // Keep the ID if needed
        email: user.email,  // Add this line to include email
        role: user.role     // Optional: role-based access
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      msg: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        photo: user.photo,
      },
    });

    
    // res.json({ token, user: { email: user.email, name: user.name } });
    // res.json({ token, user: { email: user.email, name: user.name } });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ msg: 'Login failed', error: error.message });
  }
};