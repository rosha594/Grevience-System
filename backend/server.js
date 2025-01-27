const express = require('express');
const nodemailer = require('nodemailer');
const mysql = require('mysql2');
const cron = require('node-cron');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// MySQL Database Connection
const db = mysql.createConnection({
  host: '127.0.0.1',
  port: '3308',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'student_grievance',
});

// Nodemailer Transporter Configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'rosh18ben@gmail.com',
    pass: 'wdfe zyuv cdwc zdmz',
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

// Login Endpoint
app.post('/login', (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  db.query(
    'SELECT * FROM users WHERE email = ? AND password = ? AND role = ?',
    [email, password, role],
    (err, results) => {
      if (err) return res.status(500).json({ success: false, message: 'Database error.', error: err });
      if (results.length === 0) return res.status(400).json({ success: false, message: 'Invalid credentials or role.' });

      res.json({ success: true, message: 'Login successful', user: results[0] });
    }
  );
});

// Student Grievance Submission
app.post('/student/grievance', (req, res) => {
  const { subject} = req.body;

//   if (!subject || !studentId) {
//     return res.status(400).json({ success: false, message: 'Subject and student ID are required.' });
//   }
let studentId = 1
  db.query(
    'INSERT INTO grievances (student_id, subject, status, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
    [studentId, subject, 'pending'],
    (err, result) => {
      if (err) return res.status(500).json({ success: false, message: 'Database error.', error: err });

      sendEmail('rosh18ben@gmail.com', 'New Grievance Submitted', `Grievance from student ${studentId}: ${subject}`);
      res.json({ success: true, message: 'Grievance submitted successfully.' });
    }
  );
});

// Fetch Grievances for Admin
app.get('/admin/grievances', (req, res) => {
    db.query(
      `SELECT id, student_id, subject, status, created_at FROM grievances WHERE status = 'pending'`,
      (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error.', error: err });
  
        res.json(results); // Send grievances to the frontend
      }
    );
  });
  
  // Fetch Grievances for HOD
  app.get('/hod/grievances', (req, res) => {
    db.query(
      `SELECT id, student_id, subject, status, created_at FROM grievances WHERE status = 'admin_approved'`,
      (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error.', error: err });
  
        res.json(results); // Send grievances to the frontend
      }
    );
  });
  

// Admin Approval Endpoint
app.post('/admin/approve', (req, res) => {
  const { grievanceId } = req.body;

  if (!grievanceId) {
    return res.status(400).json({ success: false, message: 'Grievance ID is required.' });
  }

  db.query(
    'UPDATE grievances SET status = ?, updated_at = NOW() WHERE id = ?',
    ['admin_approved', grievanceId],
    (err, result) => {
      if (err) return res.status(500).json({ success: false, message: 'Database error.', error: err });

      res.json({ success: true, message: 'Grievance approved by Admin.' });
      sendEmail('roshanbende@gpgit.com', 'Grievance for Approval', `Grievance ID ${grievanceId} has been approved by Admin and needs your attention.`);
    }
  );
});

// HOD Approval Endpoint
app.post('/hod/approve', (req, res) => {
  const { grievanceId } = req.body;

  if (!grievanceId) {
    return res.status(400).json({ success: false, message: 'Grievance ID is required.' });
  }

  db.query(
    'UPDATE grievances SET status = ?, updated_at = NOW() WHERE id = ?',
    ['hod_approved', grievanceId],
    (err, result) => {
      if (err) return res.status(500).json({ success: false, message: 'Database error.', error: err });

      res.json({ success: true, message: 'Grievance approved by HOD.' });
      sendEmail('roshan.erp@tgpcet.com', 'Grievance Resolved', `Your grievance with ID ${grievanceId} has been resolved.`);
    }
  );
});

// Reject Grievance Endpoint
app.post('/reject', (req, res) => {
  const { grievanceId } = req.body;

  if (!grievanceId) {
    return res.status(400).json({ success: false, message: 'Grievance ID is required.' });
  }

  db.query(
    'UPDATE grievances SET status = ?, updated_at = NOW() WHERE id = ?',
    ['rejected', grievanceId],
    (err, result) => {
      if (err) return res.status(500).json({ success: false, message: 'Database error.', error: err });

      res.json({ success: true, message: 'Grievance rejected.' });
      sendEmail('roshanbende2game@gmail.com', 'Grievance Rejected', `Your grievance with ID ${grievanceId} has been rejected.`);
    }
  );
});

// Cron Job to Alert for Pending Grievances
cron.schedule('*/5 * * * *', () => {
  db.query(
    `SELECT * FROM grievances WHERE status = 'pending' AND created_at < NOW() - INTERVAL 3 MINUTE`,
    (err, results) => {
      if (err) return console.error('Error checking grievances:', err);

      results.forEach(grievance => {
        sendEmail(
          'rosh18ben@gmail.com',
          'Pending Grievance Alert',
          `Grievance from student ID ${grievance.student_id} has been pending for more than 3 minutes.`
        );
      });
    }
  );
});

// Start Express Server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
