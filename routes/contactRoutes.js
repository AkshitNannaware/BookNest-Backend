import express from 'express';
import ContactMessage from '../models/contactMessage.js'; // Use default import

const router = express.Router();

router.post('/message', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).send({ error: 'All fields are required' });
    }

    if (message.length < 10) {
      return res.status(400).send({ error: 'Message must be at least 10 characters long' });
    }

    const newMessage = new ContactMessage({ name, email, message });

    await newMessage.save();
    res.status(201).send({ message: 'Message sent successfully' });
  } catch (err) {
    console.error('Error saving message:', err);

    if (err.name === 'ValidationError') {
      return res.status(400).send({ error: err.message });
    }

    res.status(500).send({ error: 'Something went wrong. Please try again later.' });
  }
});

export default router;