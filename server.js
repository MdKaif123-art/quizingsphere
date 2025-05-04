const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Initialize the app
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define storage location for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Store uploaded files in 'uploads' directory
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Use original file name
  }
});

const upload = multer({ storage });

// Serve static files
app.use(express.static('.'));

// Handle form submission
app.post('/send', upload.single('attachment'), (req, res) => {
  const { name, email, message } = req.body;
  const attachmentPath = req.file ? req.file.path : null;

  // Create a transporter for sending emails
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'mdkaif196905@gmail.com',
      pass: process.env.EMAIL_PASS || 'rqbk yjfc vstp pbyr'
    }
  });

  // Email options with the attachment and its original filename
  const mailOptions = {
    from: email,
    to: process.env.EMAIL_USER || 'mdkaif196905@gmail.com',
    subject: 'New Question Submission from QuizingSphere',
    text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
    attachments: attachmentPath ? [{
      path: attachmentPath,
      filename: req.file.originalname // Use original file name
    }] : []
  };

  // Send the email with attachment
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      return res.status(500).send('Error sending email');
    }
    // Clean up the uploaded file after sending email
    if (attachmentPath) {
      fs.unlinkSync(attachmentPath);
    }
    res.send('Email sent successfully');
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`QuizingSphere server started on port ${PORT}`);
}); 