// Login Form Submission
document.getElementById('loginForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const role = document.getElementById('role').value;
  let studentId;
  fetch('http://localhost:3000/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role })
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        document.getElementById('login').style.display = 'none';
        if (role === 'student') {
          studentId = data.user.id;
          document.getElementById('grievanceForm').style.display = 'block';
        } else if (role === 'admin') {
          document.getElementById('adminPanel').style.display = 'block';
          loadAdminTable();
        } else if (role === 'hod') {
          document.getElementById('hodPanel').style.display = 'block';
          loadHodTable();
        }
      } else {
        alert(data.message);
      }
    })
    .catch(err => console.error(err));
});

// Submit Grievance
document.getElementById('grievanceFormSubmit').addEventListener('submit', function (e) {
  e.preventDefault();

  const subject = document.getElementById('subject').value;

  fetch('http://localhost:3000/student/grievance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subject})
  })
    .then(response => response.json())
    .then(data => {
      alert(data.message);
    })
    .catch(err => console.error(err));
});

// Load Admin Table
function loadAdminTable() {
  fetch('http://localhost:3000/admin/grievances')
    .then(response => response.json())
    .then(data => {
      const tbody = document.getElementById('adminTable').querySelector('tbody');
      tbody.innerHTML = '';
      data.forEach(grievance => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${grievance.id}</td>
          <td>${grievance.student_id}</td>
          <td>${grievance.subject}</td>
          <td>
            <button onclick="approveGrievance(${grievance.id}, 'admin')">Approve</button>
            <button onclick="rejectGrievance(${grievance.id})">Reject</button>
          </td>
        `;
        tbody.appendChild(row);
      });
    });
}

// Load HOD Table
function loadHodTable() {
  fetch('http://localhost:3000/hod/grievances')
    .then(response => response.json())
    .then(data => {
      const tbody = document.getElementById('hodTable').querySelector('tbody');
      tbody.innerHTML = '';
      data.forEach(grievance => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${grievance.id}</td>
          <td>${grievance.student_id}</td>
          <td>${grievance.subject}</td>
          <td>
            <button onclick="approveGrievance(${grievance.id}, 'hod')">Approve</button>
            <button onclick="rejectGrievance(${grievance.id})">Reject</button>
          </td>
        `;
        tbody.appendChild(row);
      });
    });
}

// Approve Grievance
function approveGrievance(id, role) {
  fetch(`http://localhost:3000/${role}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ grievanceId: id })
  })
    .then(response => response.json())
    .then(data => {
      alert(data.message);
      if (role === 'admin') loadAdminTable();
      else if (role === 'hod') loadHodTable();
    })
    .catch(err => console.error(err));
}

// Reject Grievance
function rejectGrievance(id) {
  fetch('http://localhost:3000/reject', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ grievanceId: id })
  })
    .then(response => response.json())
    .then(data => alert(data.message))
    .catch(err => console.error(err));
}
