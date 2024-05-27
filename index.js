// index.js
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const firebaseAdmin = require('firebase-admin');
const cors = require('cors');

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');
firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
  databaseURL: "https://extension-7101d-default-rtdb.firebaseio.com",
});

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Endpoint to receive email and CSV data
app.post('/send-email-and-save-to-firebase', (req, res) => {
  const { email, csvData } = req.body;

  console.log("eeee",email);
  // Send email
  sendEmail(email, csvData)
    .then(() => {
      // Save CSV data to Firebase
      return saveDataToFirebase(csvData);
    })
    .then(() => {
      res.status(200).json({ message: 'Email sent and data saved to Firebase successfully' });
    })
    .catch((error) => {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
});

// Function to send email
function sendEmail(email, csvData) {
  return new Promise((resolve, reject) => {
    // Configure Nodemailer transporter
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com', // SMTP server hostname
        port: 587, // SMTP server port
        secure: false, // true for secure connection (TLS/STARTTLS)
        auth: {
          user: 'taimur@agilekode.com', // Your email address
          pass: 'jsas fygn qwjb luao',
        },
      });

    // Email options
    console.log("email option",email)
    const mailOptions = {
      from: 'taimur@agilekode.com',
      to: email,
      subject: 'CSV File',
      text: 'Here is your CSV file',
      attachments: [
        {
          filename: 'data.csv',
          content: csvData,
        },
      ],
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

// Function to save CSV data to Firebase
function saveDataToFirebase(csvData) {
  return firebaseAdmin.firestore().collection('csvData').add({
    data: csvData,
    timestamp: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
  });
}

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
