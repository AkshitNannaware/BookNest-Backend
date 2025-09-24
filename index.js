import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import adminRoutes from './routes/adminRoutes.js'; // Adjust path if needed
import contactRoutes from './routes/contactRoutes.js';
 
dotenv.config();

const app = express();

// app.use(cors({
//   origin: process.env.FRONTEND_URL || 'http://localhost:5173',
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
// }));


// app.use(cors({
//   origin: ['https://your-vercel-domain.vercel.app', 'http://localhost:5173'],
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
// }));




// app.use(cors({
//   origin: [
//     'https://book-nest-319j9z8lm-akshitnannaware-gmailcoms-projects.vercel.app',
//     'http://localhost:5173'
//   ],
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true
// }));






 

const allowedOrigins = [
  "http://localhost:5173",
  "https://book-nest-2ok6zknab-akshitnannaware-gmailcoms-projects.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));






app.use(express.json());
app.use('/uploads', express.static('uploads')); // Serve image files

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api', bookingRoutes);
// app.use("/api", studentRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/admin', adminRoutes);
app.use("/api/rooms", roomRoutes);
app.use('/api/contact', contactRoutes);
app.use("/api", studentRoutes);


// Environment variables
const PORT = process.env.PORT || 5000;
const URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bookenest';
// MongoDB connection
mongoose
  .connect(URI, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
    dbName: 'BookNest',
  })
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch((error) => console.error('❌ MongoDB connection error:', error.message));

// MongoDB connection events
mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err.message);
});

mongoose.connection.once('open', () => {
  console.log('✅ MongoDB connection is open');
});

// Basic route
app.get('/', (req, res) => {
  res.send('Welcome to the BookNest API!');
});


app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});