import mongoose from 'mongoose';

const rentedBySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
  },
  rentedAt: {
    type: Date,
    default: Date.now,
  },
  rentedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model who rented the room
  },  
});

const roomSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model (room owner)
    required: true,
  },
  title: {
    type: String,
    required: true,
    default: "Untitled Room",  // Optional fallback default
  },
  description: String,
  rent: {
    type: Number,
    required: true,
  },
  location: String,
  facilities: {
    type: [String],
    default: [], // Default to an empty array if no facilities are provided
  },
  photos: [String], // Store URLs or file paths for room photos
  rentedBy: [rentedBySchema], // Track who rented the room
  mobile: {type: String, required: true},
  name: { type: String, required: true },
  isBooked: { type: Boolean, default: false },
}, { timestamps: true });

const Room = mongoose.model('Room', roomSchema);

export default Room;