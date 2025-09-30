const TOKEN_KEY = 'demo_jwt_token';

const setToken = (t) => {
  if (t && typeof t === 'string') localStorage.setItem(TOKEN_KEY, t);
  updateTokenPreview();
};

const getToken = () => localStorage.getItem(TOKEN_KEY);

const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  updateTokenPreview();
};

const updateTokenPreview = () => {
  const t = getToken();
  document.getElementById('tokenPreview').textContent = t
    ? t.slice(0, 24) + '...'
    : '(none)';
};

updateTokenPreview();

async function showResponse(el, res) {
  const text = await res.text();
  el.textContent = `HTTP ${res.status}\n` + (text || '(no body)');
}

const cookieOut = document.getElementById('cookieOutput');

document.getElementById('cookieLogin').addEventListener('submit', async (e) => {
  e.preventDefault();
  const body = {
    username: e.target.username.value.trim(),
    password: e.target.password.value.trim(),
  };
  const res = await fetch('/login-cookie', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'same-origin',
  });
  await showResponse(cookieOut, res);
});

document.getElementById('cookieProfile').addEventListener('click', async () => {
  const res = await fetch('/profile-cookie', { credentials: 'same-origin' });
  await showResponse(cookieOut, res);
});

document.getElementById('cookieLogout').addEventListener('click', async () => {
  const res = await fetch('/logout-cookie', {
    method: 'POST',
    credentials: 'same-origin',
  });
  await showResponse(cookieOut, res);
});

const jwtOut = document.getElementById('jwtOutput');

document.getElementById('jwtLogin').addEventListener('submit', async (e) => {
  e.preventDefault();
  const body = {
    username: e.target.username.value.trim(),
    password: e.target.password.value.trim(),
  };
  const res = await fetch('/login-jwt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  let data = {};

  data = await res.json();

  if (data.token) setToken(data.token);
  jwtOut.textContent = `HTTP ${res.status}\n` + JSON.stringify(data, null, 2);
});

async function callJwt(endpoint) {
  const token = getToken();
  if (!token) {
    jwtOut.textContent = 'No JWT in localStorage. Please login (JWT) first.';
    return;
  }

  const headers = {};
  if (typeof token === 'string' && token.split('.').length === 3) {
    headers.Authorization = 'Bearer ' + token;
  } else {
    jwtOut.textContent = 'Stored token is invalid. Please login (JWT) again.';
    return;
  }
  const res = await fetch(endpoint, { headers });
  await showResponse(jwtOut, res);
}

document.getElementById('jwtProfile').addEventListener('click', () => {
  callJwt('/profile-jwt');
});

document.getElementById('jwtMyData').addEventListener('click', () => {
  callJwt('/my-data-jwt');
});

document.getElementById('jwtLogout').addEventListener('click', () => {
  clearToken();
  jwtOut.textContent = 'JWT cleared from localStorage.';
});
