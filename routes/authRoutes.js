import express from 'express';
import multer from 'multer';
import fs from 'fs';
import { register } from '../controllers/authController.js';
import { login } from '../controllers/authController.js';

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Only JPEG, PNG, and GIF images are allowed.'), false);
    }
    cb(null, true);
  }
});

// Register route
router.post('/register', upload.single('photo'), register);

// Login route
router.post('/login', login);

export default router;