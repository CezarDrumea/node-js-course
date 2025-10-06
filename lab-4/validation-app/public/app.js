async function fetchJson(url, options) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const message = data?.message || res.statusText;
    throw { status: res.status, data, message };
  }
  return data;
}

function serializeForm(form) {
  const formData = new FormData(form);
  const obj = {};
  for (const [key, value] of formData.entries()) {
    if (value === '') continue;
    if (key === 'age' || key === 'count') {
      obj[key] = Number(value);
    } else if (key === 'draft') {
      obj[key] = true;
    } else {
      obj[key] = value;
    }
  }
  return obj;
}

async function refreshUsers() {
  const role = document.getElementById('filter-role').value || undefined;
  const minAge = document.getElementById('filter-minAge').value || undefined;
  const maxAge = document.getElementById('filter-maxAge').value || undefined;
  const params = new URLSearchParams();
  if (role) params.set('role', role);
  if (minAge) params.set('minAge', minAge);
  if (maxAge) params.set('maxAge', maxAge);
  const listError = document.getElementById('list-error');
  listError.hidden = true;
  listError.textContent = '';
  try {
    const users = await fetchJson(`/users?${params.toString()}`);
    const list = document.getElementById('users');
    list.innerHTML = '';
    for (const user of users) {
      const li = document.createElement('li');
      li.textContent =
        `${user.id}: ${user.name} <${user.email}>` +
        (user.age ? ` (${user.age})` : '') +
        ` [${user.role}]`;
      list.appendChild(li);
    }
  } catch (err) {
    const zodErrors = err?.data?.errors;
    if (Array.isArray(zodErrors)) {
      listError.textContent = zodErrors
        .map((e) => `${e.path.join('.')}: ${e.message}`)
        .join('\n');
    } else {
      listError.textContent = err.message || 'Unknown error';
    }
    listError.hidden = false;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('refresh').addEventListener('click', () => {
    refreshUsers().catch((err) => console.error(err));
  });

  document
    .getElementById('create-form')
    .addEventListener('submit', async (e) => {
      e.preventDefault();
      const errorEl = document.getElementById('form-error');
      errorEl.hidden = true;
      errorEl.textContent = '';
      try {
        const body = serializeForm(e.target);
        await fetchJson('/users', {
          method: 'POST',
          body: JSON.stringify(body),
        });
        e.target.reset();
        await refreshUsers();
      } catch (err) {
        const zodErrors = err?.data?.errors;
        if (Array.isArray(zodErrors)) {
          errorEl.textContent = zodErrors
            .map((e) => `${e.path.join('.')}: ${e.message}`)
            .join('\n');
        } else {
          errorEl.textContent = err.message || 'Unknown error';
        }
        errorEl.hidden = false;
      }
    });

  document
    .getElementById('validator-form')
    .addEventListener('submit', async (e) => {
      e.preventDefault();
      const resultEl = document.getElementById('validator-result');
      resultEl.textContent = '';
      try {
        const body = serializeForm(e.target);
        const params = new URLSearchParams();
        if (body.draft) params.set('draft', 'true');
        const data = await fetchJson(
          `/users/validator-example?${params.toString()}`,
          {
            method: 'POST',
            body: JSON.stringify({ title: body.title, count: body.count }),
          }
        );
        resultEl.textContent = JSON.stringify(data, null, 2);
      } catch (err) {
        resultEl.textContent = JSON.stringify(
          err.data || { message: err.message },
          null,
          2
        );
      }
    });

  refreshUsers().catch((err) => console.error(err));
});
