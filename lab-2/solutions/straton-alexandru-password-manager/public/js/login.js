const TOKEN_KEY = 'pm_jwt_token';

document.getElementById('jwtLoginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('jwt-username').value.trim();
  const password = document.getElementById('jwt-password').value.trim();
  const messageDiv = document.getElementById('jwtMessage');

  try {
    const res = await fetch('/login-jwt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (res.ok && data.token) {
      localStorage.setItem(TOKEN_KEY, data.token);
      messageDiv.innerHTML = '<div class="alert alert-success"><i class="bi bi-check-circle"></i> Login successful! Redirecting...</div>';
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    } else {
      messageDiv.innerHTML = `<div class="alert alert-danger"><i class="bi bi-exclamation-circle"></i> ${data.message || 'Login failed'}</div>`;
    }
  } catch (error) {
    messageDiv.innerHTML = `<div class="alert alert-danger"><i class="bi bi-exclamation-circle"></i> Error: ${error.message}</div>`;
  }
});
