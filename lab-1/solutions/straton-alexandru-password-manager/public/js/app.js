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
