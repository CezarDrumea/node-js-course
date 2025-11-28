const TOKEN_KEY = 'pm_jwt_token';

// Setup JWT fetch interceptor immediately
(function setupJwtInterceptor() {
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const token = localStorage.getItem(TOKEN_KEY);
    console.log('[Interceptor] Fetch to:', args[0], 'Token:', token ? 'YES' : 'NO');
    if (token) {
      if (!args[1]) args[1] = {};
      if (!args[1].headers) args[1].headers = {};
      if (!args[1].headers['Authorization']) {
        args[1].headers['Authorization'] = `Bearer ${token}`;
        console.log('[Interceptor] Added Authorization header');
      } else {
        console.log('[Interceptor] Authorization header already exists');
      }
    }
    return originalFetch.apply(this, args);
  };
})();

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
      messageDiv.innerHTML = '<div class="alert alert-success alert-dismissible fade show" role="alert"><i class="bi bi-check-circle"></i> Login successful! Loading dashboard...<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>';

      // Navigate to dashboard; data will be loaded via JWT-protected API
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    } else {
      messageDiv.innerHTML = `<div class="alert alert-danger alert-dismissible fade show" role="alert"><i class="bi bi-exclamation-circle"></i> ${data.message || 'Login failed'}<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>`;
    }
  } catch (error) {
    messageDiv.innerHTML = `<div class="alert alert-danger alert-dismissible fade show" role="alert"><i class="bi bi-exclamation-circle"></i> Error: ${error.message}<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>`;
  }
});
