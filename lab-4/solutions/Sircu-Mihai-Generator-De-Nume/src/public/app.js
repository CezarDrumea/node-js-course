const availableListEl = document.getElementById('available-names');
const savedListEl = document.getElementById('saved-names');
const generatedNameEl = document.getElementById('generated-name');

const generateBtn = document.getElementById('generate-btn');
const saveBtn = document.getElementById('save-btn');
const editGeneratedBtn = document.getElementById('edit-generated-btn');

let availableNames = [];
let savedNames = [];
let currentGenerated = '';

function escapeHtml(s) {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

function renderAvailable() {
  if (!availableNames.length) {
    availableListEl.innerHTML = '<li>Nu există nume disponibile.</li>';
    return;
  }
  availableListEl.innerHTML = availableNames
    .map((n) => `<li>${escapeHtml(n)}</li>`)
    .join('');
}

function renderSaved() {
  if (!savedNames.length) {
    savedListEl.innerHTML = '<li>Nu există nume salvate.</li>';
    return;
  }

  savedListEl.innerHTML = savedNames
    .map(
      (n) => `
  <li class="item" data-id="${n.id}">
    <span class="text">${escapeHtml(n.name)}</span>
    <div class="actions">
      <button class="edit">Modifică</button>
      <button class="remove">Șterge</button>
    </div>
  </li>`
    )
    .join('');
}

async function loadAvailable() {
  try {
    const res = await fetch('/names/api');
    if (!res.ok) throw new Error(`Eroare la /names/api: ${res.status}`);
    availableNames = await res.json();
    renderAvailable();
  } catch (e) {
    console.error(e);
    availableListEl.innerHTML = '<li class="loading">Nu s-au putut încărca numele.</li>';
  }
}

async function loadSaved() {
  try {
    const res = await fetch('/names/saved');
    if (!res.ok) throw new Error(`Eroare la /names/saved: ${res.status}`);
    savedNames = await res.json();
    renderSaved();
  } catch (e) {
    console.error(e);
    savedListEl.innerHTML = '<li class="loading">Nu s-au putut încărca numele salvate.</li>';
  }
}

function pickRandomName() {
  if (availableNames.length < 2) return null;
  const firstIndex = Math.floor(Math.random() * availableNames.length);
  let secondIndex = Math.floor(Math.random() * availableNames.length);
  if (secondIndex === firstIndex) {
    secondIndex = (secondIndex + 1) % availableNames.length;
  }
  return `${availableNames[firstIndex]} ${availableNames[secondIndex]}`;
}

function setGenerated(name) {
  currentGenerated = name;
  generatedNameEl.textContent = name || '--';
}

generateBtn.addEventListener('click', () => {
  const name = pickRandomName();
  if (!name) {
    alert('Nu sunt suficiente nume pentru a genera un nume complet.');
    return;
  }
  setGenerated(name);
});

saveBtn.addEventListener('click', async () => {
  if (!currentGenerated) {
    alert('Generează mai întâi un nume.');
    return;
  }

  await fetch('/names/api', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: currentGenerated }),
  });

  loadSaved();
});

editGeneratedBtn.addEventListener('click', () => {
  const current = currentGenerated || '';
  const value = prompt('Modifică numele generat:', current);
  if (!value) return;
  const next = value.trim();
  if (!next) return;
  setGenerated(next);
});

savedListEl.addEventListener('click', async (e) => {
  const li = e.target.closest('.item');
  if (!li) return;
  const id = li.getAttribute('data-id');

  if (e.target.classList.contains('remove')) {
    await fetch(`/names/api/${id}`, { method: 'DELETE' });
    loadSaved();
  }

  if (e.target.classList.contains('edit')) {
    const current = li.querySelector('.text').textContent;
    const next = prompt('Modifică numele salvat:', current);
    if (!next || !next.trim() || next === current) return;

    await fetch(`/names/api/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: next.trim() }),
    });
    loadSaved();
  }
});

loadAvailable();
loadSaved();
