CREATE DATABASE student_grievance;

USE student_grievance;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  role ENUM('student', 'admin', 'hod')
);

CREATE TABLE grievances (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT,
  subject VARCHAR(255),
  status ENUM('pending', 'admin_approved', 'hod_approved', 'resolved'),
  created_at DATETIME,
  updated_at DATETIME,
  FOREIGN KEY (student_id) REFERENCES users(id)
);

CREATE TABLE email_alerts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  grievance_id INT,
  sent_at DATETIME,
  alert_type ENUM('admin_alert', 'hod_alert'),
  FOREIGN KEY (grievance_id) REFERENCES grievances(id)
);
