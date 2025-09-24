import express from 'express';
import Booking from '../models/bookingSchema.js';
import Room from '../models/Room.js';
import authenticate from '../middlewares/authenticate.js';

const router = express.Router();

// GET rented rooms for a student
router.get('/rented', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'student' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const bookings = await Booking.find({ studentId: req.user.id }).populate('roomId');

    if (!bookings.length) {
      return res.status(404).json({ message: 'No rented rooms found.' });
    }

    const rentedRooms = bookings
      .filter(booking => booking.roomId)
      .map(booking => ({
        bookingId: booking._id.toString(),
        ...booking.roomId.toObject(),
        bookedAt: booking.bookedAt,
      }));

    res.status(200).json(rentedRooms);
  } catch (error) {
    console.error('Error fetching rented rooms:', error.message);
    res.status(500).json({ message: 'Failed to fetch rented rooms', error: error.message });
  }
});

// POST book a room with check if already booked
router.post('/book-room', authenticate, async (req, res) => {
  try {
    const { roomId } = req.body;

    if (!roomId) {
      return res.status(400).json({ message: 'Room ID is required' });
    }

    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can book rooms' });
    }

    // Check if the room is already booked by any student
    const existingBooking = await Booking.findOne({ roomId });
    if (existingBooking) {
      return res.status(400).json({ message: 'Room is already booked' });
    }

    const booking = new Booking({
      studentId: req.user.id,
      roomId,
      bookedAt: new Date(),
    });

    await booking.save();

    res.status(201).json({ message: 'Room booked successfully', booking });
  } catch (error) {
    console.error('Booking error:', error.message);
    res.status(500).json({ message: 'Failed to book room', error: error.message });
  }
});

// DELETE booking with 24-hour cancellation check
router.delete('/bookings/:bookingId', authenticate, async (req, res) => {
  const { bookingId } = req.params;

  try {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.studentId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const now = new Date();
    const bookedAt = new Date(booking.bookedAt);
    const diffHours = (now - bookedAt) / (1000 * 60 * 60);
    if (diffHours > 24) {
      return res.status(400).json({ message: 'Cancellation period expired' });
    }

    await Booking.findByIdAndDelete(bookingId);

    res.status(200).json({ message: 'Booking canceled successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;