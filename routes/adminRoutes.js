import express from 'express';
import User from '../models/userSchema.js';
import Room from '../models/Room.js';
import Booking from '../models/bookingSchema.js';
import jwt from 'jsonwebtoken';
import ContactMessage from '../models/contactMessage.js';

const router = express.Router();

// Middleware to verify admin
const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized: No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded); // Log the decoded token to debug

    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admins only' });
    }
    next();
  } catch (err) {
    console.error(err); // Log the error for better debugging
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Get all students with booking history
router.get('/students', verifyAdmin, async (req, res) => {
  try {
    // Fetch all students
    const students = await User.find({ role: 'student' }).exec();

    // For each student, find their bookings in the Booking collection
    const studentData = await Promise.all(
      students.map(async (student) => {
        // Fetch the student's bookings
        const bookings = await Booking.find({ studentId: student._id }).populate('roomId').exec();

        const totalBookings = bookings.length;
        const lastBooking = bookings[totalBookings - 1]; // Get the last booking

        // Format the last booking date if it exists
        const lastBookingDate = lastBooking ? new Date(lastBooking.bookedAt).toLocaleString() : 'N/A';

        return {
          email: student.email,
          phone: student.phone || 'N/A',
          totalBookings,
          lastBookingDate,
        };
      })
    );

    res.json(studentData);
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).send('Server Error');
  }
});

// Example of populating the ownerId to fetch owner details like mobile
router.get('/owners', verifyAdmin, async (req, res) => {
  try {
    const owners = await Room.find()
      .populate('ownerId', 'email mobile') // Only populate email and mobile of the owner
      .exec();

    const ownerData = owners.map(room => ({
      email: room.ownerId.email,
      mobile: room.ownerId.mobile,
      lastUpload: room.createdAt, // You can adjust this field as per your requirement
      totalEarnings: room.rent, // For simplicity, consider room rent as earnings
    }));

    res.json(ownerData);
  } catch (err) {
    console.error('Error fetching owners:', err);
    res.status(500).send('Server Error');
  }
});

// Only accessible to admins
router.get('/messages', async (req, res) => {
  try {
    const messages = await ContactMessage.find();
    res.status(200).json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Unable to fetch messages' });
  }
});

export default router;