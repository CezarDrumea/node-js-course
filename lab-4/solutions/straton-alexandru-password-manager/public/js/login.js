const TOKEN_KEY = 'pm_jwt_token';

// Cookie Login Handler
document.getElementById('cookieLoginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('cookie-username').value.trim();
  const password = document.getElementById('cookie-password').value.trim();
  const messageDiv = document.getElementById('cookieMessage');

  try {
    const res = await fetch('/login-cookie', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (res.ok) {
      messageDiv.innerHTML = '<div class="alert alert-success alert-dismissible fade show" role="alert"><i class="bi bi-check-circle"></i> Login successful! Loading dashboard...<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>';

      try {
        // Load the protected dashboard (cookie will be sent automatically)
        const pageRes = await fetch('/', {
          credentials: 'include'
        });

        if (!pageRes.ok) {
          const errText = await pageRes.text();
          messageDiv.innerHTML = `<div class="alert alert-danger alert-dismissible fade show" role="alert"><i class="bi bi-exclamation-circle"></i> Failed to load dashboard: ${pageRes.status} ${pageRes.statusText}<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>`;
          console.error('Dashboard load error:', pageRes.status, errText);
          return;
        }

        const html = await pageRes.text();
        // Replace current document with the dashboard HTML
        document.open();
        document.write(html);
        document.close();
        // Update URL to '/'
        window.history.pushState(null, '', '/');

        // Ensure dashboard script is loaded and initialized
        const script = document.createElement('script');
        script.src = '/js/dashboard.js';
        script.defer = true;
        document.body.appendChild(script);
      } catch (err) {
        console.error('Error loading dashboard with cookie:', err);
        messageDiv.innerHTML = `<div class="alert alert-danger alert-dismissible fade show" role="alert"><i class="bi bi-exclamation-circle"></i> Error loading dashboard: ${err.message}<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>`;
      }
    } else {
      messageDiv.innerHTML = `<div class="alert alert-danger alert-dismissible fade show" role="alert"><i class="bi bi-exclamation-circle"></i> ${data.message || 'Login failed'}<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>`;
    }
  } catch (error) {
    messageDiv.innerHTML = `<div class="alert alert-danger alert-dismissible fade show" role="alert"><i class="bi bi-exclamation-circle"></i> Error: ${error.message}<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>`;
  }
});

// JWT Login Handler
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

      try {
        // Load the protected dashboard using the JWT in the Authorization header
        const pageRes = await fetch('/', {
          headers: { 'Authorization': `Bearer ${data.token}` }
        });

        if (!pageRes.ok) {
          const errText = await pageRes.text();
          messageDiv.innerHTML = `<div class="alert alert-danger alert-dismissible fade show" role="alert"><i class="bi bi-exclamation-circle"></i> Failed to load dashboard: ${pageRes.status} ${pageRes.statusText}<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>`;
          console.error('Dashboard load error:', pageRes.status, errText);
          return;
        }

        const html = await pageRes.text();
        // Replace current document with the dashboard HTML
        document.open();
        document.write(html);
        document.close();
        // Update URL to '/'
        window.history.pushState(null, '', '/');

        // Ensure dashboard script is loaded and initialized
        const script = document.createElement('script');
        script.src = '/js/dashboard.js';
        script.defer = true;
        document.body.appendChild(script);
      } catch (err) {
        console.error('Error loading dashboard with JWT:', err);
        messageDiv.innerHTML = `<div class="alert alert-danger alert-dismissible fade show" role="alert"><i class="bi bi-exclamation-circle"></i> Error loading dashboard: ${err.message}<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>`;
      }
    } else {
      messageDiv.innerHTML = `<div class="alert alert-danger alert-dismissible fade show" role="alert"><i class="bi bi-exclamation-circle"></i> ${data.message || 'Login failed'}<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>`;
    }
  } catch (error) {
    messageDiv.innerHTML = `<div class="alert alert-danger alert-dismissible fade show" role="alert"><i class="bi bi-exclamation-circle"></i> Error: ${error.message}<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>`;
  }
});
