const express = require('express');
const nodemailer = require('nodemailer');
const mysql = require('mysql2');
const cron = require('node-cron');
const cors = require('cors'); // Import cors
require('dotenv').config();

const app = express();

// Enable CORS for all routes
app.use(cors());  // Allow cross-origin requests
app.use(express.json());

// MySQL Database Connection
const db = mysql.createConnection({
  host: '127.0.0.1',   // Ensure it's localhost
  port: '3308',
  user: 'root',  // Replace with your MySQL username
  password: '',  // Replace with your MySQL password
  database: 'student_grievance',  // Replace with your database name
});

// Nodemailer Transporter Configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'rosh18ben@gmail.com',
    pass: 'wdfe zyuv cdwc zdmz'
    // user: process.env.EMAIL_USER,
    // pass: process.env.EMAIL_PASS,
  },
});

// Function to send email
function sendEmail(to, subject, text) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
}
// Endpoint for student login
app.post('/student/login', (req, res) => {
  const { email, password } = req.body;
    console.log(email+password)
  db.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, results) => {
//   db.query('SELECT * FROM users WHERE email = ? AND password = ?', ['st1@gmail.com', '123'], (err, results) => {
    console.log(results)
    if (err) return res.status(500).send(err);
    if (results.length === 0) return res.status(400).send('Invalid login credentials.');

    const user = results[0];
    if (user.role === 'student') {
      res.send('Login successful');
    } else {
      res.status(403).send('Not authorized');
    }
  });
});

// Endpoint for grievance submission by student
app.post('/student/grievance', (req, res) => {
  const { subject } = req.body;

  // Assuming student ID is stored in session or token, for now using a static student ID (e.g., 1)
  const studentId = 1; // Replace this with actual student ID from session or token

  db.query('INSERT INTO grievances (student_id, subject, status, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
    [studentId, subject, 'pending'], (err, result) => {
      if (err) return res.status(500).send(err);

      const grievanceId = result.insertId;
      sendEmail('roshanbende@gpgit.com', 'New Grievance', `Grievance from student ${studentId}: ${subject}`);
      res.send('Grievance submitted successfully');
    });
});

// Cron job to send alert email for pending grievances
cron.schedule('*/5 * * * *', () => {
    console.log('ii')
  db.query(
    `SELECT * FROM grievances WHERE status = 'pending' AND created_at < NOW() - INTERVAL 3 MINUTE`,
    (err, results) => {
      if (err) return console.error('Error checking grievances:', err);

      results.forEach(grievance => {
        sendEmail('roshanbende@gpgit.com', 'Grievance Pending Alert', `Grievance from student ${grievance.student_id} has been pending for over 1 hour.`);
      });
    }
  );
});

// Endpoint for admin to approve grievance
app.post('/admin/approve', (req, res) => {
  const { grievanceId } = req.body;

  db.query('UPDATE grievances SET status = ?, updated_at = NOW() WHERE id = ?',
    ['admin_approved', grievanceId], (err, result) => {
      if (err) return res.status(500).send(err);
      res.send('Grievance approved by Admin');
      sendEmail('rosh18ben@gmail.com', 'Grievance for Approval', `Grievance needs approval from HOD.`);
    });
});

// Endpoint for HOD to approve grievance
app.post('/hod/approve', (req, res) => {
  const { grievanceId } = req.body;

  db.query('UPDATE grievances SET status = ?, updated_at = NOW() WHERE id = ?',
    ['hod_approved', grievanceId], (err, result) => {
      if (err) return res.status(500).send(err);
      res.send('Grievance approved by HOD');
      sendEmail('roshan.erp@tgpcet.com', 'Grievance Resolved', 'Your grievance has been resolved successfully.');
    });
});

// Start Express server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
