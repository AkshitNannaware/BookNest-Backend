import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  name: String,
  email: String,
  phone: String,
  gender: String,
  guests: Number,
  months: Number,
  bookedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Booking", bookingSchema);