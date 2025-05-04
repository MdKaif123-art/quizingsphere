const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Initialize the app
const app = express();

// Configure CORS
const corsOptions = {
  origin: '*', // Allow all origins in development
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
};

// Enable CORS for all routes
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Configure multer to use memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Serve static files
app.use(express.static('.'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Handle form submission
app.post('/send', upload.single('attachment'), async (req, res) => {
  try {
    console.log('Request received:', req.body);
    
    const { name, email, message } = req.body;
    const file = req.file;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Name, email, and message are required'
      });
    }

    // Create a transporter for sending emails
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'mdkaif196905@gmail.com',
        pass: process.env.EMAIL_PASS || 'rqbk yjfc vstp pbyr'
      }
    });

    // Email options
    const mailOptions = {
      from: email,
      to: process.env.EMAIL_USER || 'mdkaif196905@gmail.com',
      subject: 'New Question Submission from QuizingSphere',
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
      attachments: file ? [{
        filename: file.originalname,
        content: file.buffer
      }] : []
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);

    res.status(200).json({
      success: true,
      message: 'Email sent successfully'
    });
  } catch (error) {
    console.error('Error processing form submission:', error);
    res.status(500).json({
      error: 'Failed to send email',
      message: error.message
    });
  }
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`QuizingSphere server started on port ${PORT}`);
  console.log('Environment:', process.env.NODE_ENV || 'development');
}); 