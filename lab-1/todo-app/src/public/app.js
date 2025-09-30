const listEl = document.getElementById('list');
const formEl = document.getElementById('create-form');

function render(tasks) {
  listEl.innerHTML = tasks.map((t) => template(t)).join('');
}

async function refresh() {
  const res = await fetch('/tasks/api');
  const tasks = await res.json();
  render(tasks);
}

function escapeHtml(s) {
  const div = document.createElement('div');
  div.textContent = s;
  console.log(div.textContent);
  return div.innerHTML;
}

function template(t) {
  return `
<li class="item" data-id="${t.id}">
    <label>
        <input class="toggle" type="checkbox" ${t.done ? 'checked' : ''} />
        <span class="text ${t.done ? 'done' : ''}">${escapeHtml(t.text)}</span>
    </label>
    <div class="actions">
        <button class="edit">Edit</button>
        <button class="remove">Delete</button>
    </div>
</li>`;
}

formEl.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(formEl);
  console.log(fd);
  const text = (fd.get('text') || '').toString().trim();
  if (!text) return;
  await fetch('/tasks/api', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });

  formEl.reset();
  refresh();
});

listEl.addEventListener('click', async (e) => {
  const li = e.target.closest('.item');
  if (!li) return;
  const id = li.getAttribute('data-id');

  if (e.target.classList.contains('remove')) {
    await fetch(`/tasks/api/${id}`, { method: 'DELETE' });
    refresh();
  }

  if (e.target.classList.contains('edit')) {
    const current = li.querySelector('.text').textContent;
    const next = prompt('Edit task:', current);
    if (next && next.trim() && next !== current) {
      await fetch(`/tasks/api/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: next.trim() }),
      });
      refresh();
    }
  }
});

listEl.addEventListener('change', async (e) => {
  if (!e.target.classList.contains('toggle')) return;
  const li = e.target.closest('.item');
  const id = li.getAttribute('data-id');
  await fetch(`/tasks/api/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ done: e.target.checked }),
  });
  refresh();
});

refresh();
