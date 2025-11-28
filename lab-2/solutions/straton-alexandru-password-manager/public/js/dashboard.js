 (function () {
  if (window.__pmDashboardInitialized) {
    // Prevent double initialization when script is loaded multiple times
    return;
  }
  window.__pmDashboardInitialized = true;

  // JWT Token Management - Attach token to all requests (also supports cookie sessions)
  const TOKEN_KEY = 'pm_jwt_token';

  // Load dashboard data via auth-protected API (cookie or JWT)
  async function loadDashboard() {
    try {
      const res = await fetch('/api/dashboard', { credentials: 'same-origin' });
      if (res.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        window.location.href = '/login';
        return;
      }
      if (!res.ok) {
        console.error('Dashboard load error:', res.status);
        return;
      }

      const data = await res.json();
      renderDashboard(data);
    } catch (error) {
      console.error('Dashboard load error:', error);
    }
  }

  function renderDashboard(data) {
    const { user, masterKey, passwords } = data;

    const userNameEl = document.getElementById('userName');
    if (userNameEl && user && user.name) {
      userNameEl.textContent = user.name;
    }

    const masterKeyEl = document.getElementById('masterKey');
    if (masterKeyEl && masterKey) {
      masterKeyEl.textContent =
        masterKey.length > 48 ? masterKey.substring(0, 48) + '...' : masterKey;
    }

    const noPasswordsAlert = document.getElementById('noPasswordsAlert');
    const passwordsCard = document.getElementById('passwordsCard');
    const tbody = document.getElementById('passwordsBody');

    if (!passwords || passwords.length === 0) {
      if (passwordsCard) passwordsCard.classList.add('d-none');
      if (noPasswordsAlert) noPasswordsAlert.classList.remove('d-none');
      if (tbody) tbody.innerHTML = '';
      return;
    }

    if (noPasswordsAlert) noPasswordsAlert.classList.add('d-none');
    if (passwordsCard) passwordsCard.classList.remove('d-none');

    if (!tbody) return;
    tbody.innerHTML = '';

    passwords.forEach((pwd) => {
      const tr = document.createElement('tr');
      const notes = pwd.notes || '';
      const notesPreview = notes.length > 30 ? notes.substring(0, 30) + '...' : notes;
      const created = pwd.createdAt ? new Date(pwd.createdAt).toLocaleDateString() : '';

      tr.innerHTML = `
        <td>
          <div class="fw-semibold">${pwd.website}</div>
          <div class="d-sm-none small text-muted">@ ${pwd.username}</div>
        </td>
        <td class="d-none d-sm-table-cell">${pwd.username}</td>
        <td>
          <div class="d-flex align-items-center gap-2">
            <span class="password-hidden" id="pwd-${pwd.id}">••••••••</span>
            <button class="btn btn-sm btn-outline-secondary reveal-btn" data-id="${pwd.id}">
              <i class="bi bi-eye"></i>
            </button>
          </div>
        </td>
        <td class="d-none d-md-table-cell">${notesPreview}</td>
        <td class="d-none d-md-table-cell">${created}</td>
        <td class="text-nowrap">
          <button class="btn btn-sm btn-outline-warning edit-btn"
                  data-id="${pwd.id}"
                  data-website="${pwd.website}"
                  data-username="${pwd.username}"
                  data-notes="${notes}">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${pwd.id}">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Attach actions for dynamically rendered rows
    document.querySelectorAll('.reveal-btn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const span = document.getElementById(`pwd-${id}`);

        if (span.classList.contains('password-hidden')) {
          const res = await fetch(`/reveal/${id}`, { method: 'POST' });
          const data = await res.json();
          span.textContent = data.password;
          span.classList.remove('password-hidden');
          btn.innerHTML = '<i class="bi bi-eye-slash"></i>';
        } else {
          span.textContent = '••••••••';
          span.classList.add('password-hidden');
          btn.innerHTML = '<i class="bi bi-eye"></i>';
        }
      });
    });

    document.querySelectorAll('.delete-btn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (!confirm('Are you sure you want to delete this password?')) return;

        const id = btn.dataset.id;
        await fetch(`/delete/${id}`, { method: 'DELETE' });
        location.reload();
      });
    });

    const editModal = new bootstrap.Modal(document.getElementById('editModal'));
    document.querySelectorAll('.edit-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.getElementById('edit-id').value = btn.dataset.id;
        document.getElementById('edit-website').value = btn.dataset.website;
        document.getElementById('edit-username').value = btn.dataset.username;
        document.getElementById('edit-notes').value = btn.dataset.notes;
        document.getElementById('edit-password').value = '';
        editModal.show();
      });
    });
  }

  // Initial load
  loadDashboard();

  const originalFetch = window.fetch;

  window.fetch = function(...args) {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      // Ensure args[1] exists (options object)
      if (!args[1]) {
        args[1] = {};
      }
      // Ensure headers exist and merge with existing headers
      if (!args[1].headers) {
        args[1].headers = {};
      } else if (args[1].headers instanceof Headers) {
        // Convert Headers object to plain object for merging
        const headersObj = {};
        args[1].headers.forEach((value, key) => {
          headersObj[key] = value;
        });
        args[1].headers = headersObj;
      }
      // Attach JWT token (will not override if already set)
      if (!args[1].headers['Authorization']) {
        args[1].headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return originalFetch.apply(this, args);
  };

  // Add password form handler
  const addForm = document.querySelector('form[action="/add"]');
  if (addForm) {
    addForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = {
        website: addForm.querySelector('input[name="website"]').value,
        username: addForm.querySelector('input[name="username"]').value,
        password: addForm.querySelector('input[name="password"]').value,
        notes: addForm.querySelector('textarea[name="notes"]').value
      };
      
      try {
        const res = await fetch('/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        
        if (res.ok) {
          location.reload();
        } else {
          console.error('Add password error:', res.status);
        }
      } catch (error) {
        console.error('Add password error:', error);
      }
    });
  }

  // Reveal password
  document.querySelectorAll('.reveal-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const span = document.getElementById(`pwd-${id}`);
      
      if (span.classList.contains('password-hidden')) {
        const res = await fetch(`/reveal/${id}`, { method: 'POST' });
        const data = await res.json();
        span.textContent = data.password;
        span.classList.remove('password-hidden');
        btn.innerHTML = '<i class="bi bi-eye-slash"></i>';
      } else {
        span.textContent = '••••••••';
        span.classList.add('password-hidden');
        btn.innerHTML = '<i class="bi bi-eye"></i>';
      }
    });
  });

  // Delete password
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Are you sure you want to delete this password?')) return;
      
      const id = btn.dataset.id;
      await fetch(`/delete/${id}`, { method: 'DELETE' });
      location.reload();
    });
  });

  // Edit password
  const editModal = new bootstrap.Modal(document.getElementById('editModal'));
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('edit-id').value = btn.dataset.id;
      document.getElementById('edit-website').value = btn.dataset.website;
      document.getElementById('edit-username').value = btn.dataset.username;
      document.getElementById('edit-notes').value = btn.dataset.notes;
      document.getElementById('edit-password').value = '';
      editModal.show();
    });
  });

  document.getElementById('editForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('edit-id').value;
    const formData = {
      website: document.getElementById('edit-website').value,
      username: document.getElementById('edit-username').value,
      password: document.getElementById('edit-password').value,
      notes: document.getElementById('edit-notes').value
    };
    
    await fetch(`/update/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    location.reload();
  });

  // Password generator
  function generatePassword(length = 16) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{}';
    let result = '';

    const array = new Uint32Array(length);
    if (window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(array);
      for (let i = 0; i < length; i++) {
        result += chars[array[i] % chars.length];
      }
    } else {
      for (let i = 0; i < length; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
      }
    }

    return result;
  }

  const addPasswordInput = document.getElementById('add-password');
  const generateAddBtn = document.getElementById('generate-add-password');
  if (addPasswordInput && generateAddBtn) {
    generateAddBtn.addEventListener('click', () => {
      addPasswordInput.value = generatePassword();
    });
  }

  const editPasswordInput = document.getElementById('edit-password');
  const generateEditBtn = document.getElementById('generate-edit-password');
  if (editPasswordInput && generateEditBtn) {
    generateEditBtn.addEventListener('click', () => {
      editPasswordInput.value = generatePassword();
    });
  }

  // Logout functionality
  document.getElementById('logoutBtn').addEventListener('click', async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    
    if (token) {
      // JWT logout
      try {
        await fetch('/logout-jwt', { method: 'POST' });
      } catch (e) {
        console.error('JWT logout error:', e);
      }
      localStorage.removeItem(TOKEN_KEY);
    } else {
      // Cookie logout
      try {
        await fetch('/logout-cookie', { method: 'POST', credentials: 'same-origin' });
      } catch (e) {
        console.error('Cookie logout error:', e);
      }
    }
    
    window.location.href = '/login';
  });

})();
