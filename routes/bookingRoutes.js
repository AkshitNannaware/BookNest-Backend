import express from 'express';
import mongoose from 'mongoose';
import Booking from '../models/bookingSchema.js';
import Room from '../models/Room.js';
import authenticate from '../middlewares/authenticate.js';

const router = express.Router();

router.post('/book-room', authenticate, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ error: "Only students can book rooms." });
    }

    const studentId = req.user.id;
    const { roomId, months } = req.body;

    if (!mongoose.Types.ObjectId.isValid(studentId) || !mongoose.Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({ error: 'Invalid roomId or studentId format' });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ error: 'Room not found.' });
    }

    // Calculate booking dates
    const startDate = new Date(); // today
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + parseInt(months || 1));

    // Check for booking conflicts
    const conflictingBooking = await Booking.findOne({
      roomId,
      $or: [
        { startDate: { $lte: endDate }, endDate: { $gte: startDate } }
      ]
    });

    if (conflictingBooking) {
      return res.status(400).json({ error: "Room is already booked during this period" });
    }

    // Save booking
    const booking = new Booking({
      studentId,
      roomId,
      startDate,
      endDate
    });

    await booking.save();

    res.status(201).json({ message: 'Room booked successfully', booking });
  } catch (err) {
    console.error('Booking error:', err.message);
    res.status(500).json({ error: 'Booking failed', details: err.message });
  }
});


// GET /api/rooms/rented
router.get("/rooms/rented", authenticate, async (req, res) => {
  try {
    const bookings = await Booking.find({ studentId: req.user.id }).populate("roomId");
    console.log('Fetched rented rooms:', bookings);

    const rentedRooms = bookings.map(booking => ({
      ...booking.roomId.toObject(),
      bookedAt: booking.bookedAt
    }));

    if (!rentedRooms.length) {
      return res.status(404).json({ message: "No rented rooms found." });
    }

    res.status(200).json(rentedRooms);
  } catch (error) {
    console.error('Failed to fetch rented rooms:', error.message);
    res.status(500).json({ message: "Failed to fetch rooms", error: error.message });
  }
});

export default router;