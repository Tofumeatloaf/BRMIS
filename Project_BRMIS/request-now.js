document.getElementById('requestNowForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const name = document.getElementById('requestName').value.trim();
  const email = document.getElementById('requestEmail').value.trim();
  const details = document.getElementById('requestDetails').value.trim();

  if (!name) {
    alert('Please enter your name.');
    return;
  }

  if (!email || !validateEmail(email)) {
    alert('Please enter a valid email address.');
    return;
  }

  if (!details) {
    alert('Please enter request details.');
    return;
  }

  // Show success modal
  document.getElementById('modalTitle').textContent = 'Request Submitted';
  document.getElementById('modalMessage').textContent = 'Your request has been successfully submitted. We will get back to you soon.';
  document.getElementById('successModal').style.display = 'flex';

  document.getElementById('proceedBtn').onclick = function() {
    document.getElementById('successModal').style.display = 'none';
    document.getElementById('requestNowForm').reset();
  };
});

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
