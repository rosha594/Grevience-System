document.getElementById('loginForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  fetch('http://localhost:3000/student/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
  })
  .then(response => {
      if (response.ok) {
          document.getElementById('login').style.display = 'none';
          document.getElementById('grievanceForm').style.display = 'block';
      } else {
          alert('Invalid login credentials');
      }
  })
  .catch(err => console.error(err));
});

document.getElementById('grievanceFormSubmit').addEventListener('submit', function (e) {
  e.preventDefault();

  const subject = document.getElementById('subject').value;

  // Use the correct endpoint for submitting grievance
  fetch('http://localhost:3000/student/grievance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject }) // Pass only the subject here
  })
  .then(response => {
      if (response.ok) {
          alert('Grievance submitted successfully');
          document.getElementById('grievanceForm').style.display = 'none';
      } else {
          alert('Failed to submit grievance');
      }
  })
  .catch(err => console.error(err));
});
