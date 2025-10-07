const formEl = document.getElementById('create-form');
const inputEl = document.getElementById('create-input');
const listEl = document.getElementById('list');

// https://github.com/CezarDrumea/node-js-course

// Render notes
function render(notes) {
    listEl.textContent = '';
    notes.forEach(note => {
        const li = document.createElement('li');
        li.className = 'item';
        li.dataset.id = note.id;

        const span = document.createElement('span');
        span.className = 'text';
        span.textContent = note.text;

        const actions = document.createElement('div');
        actions.className = 'actions';

        // Edit button
        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.className = 'edit';
        editBtn.textContent = 'Editează';
        editBtn.addEventListener('click', async () => {
            const newText = prompt('Editează textul:', note.text);
            if (!newText) return;
            await fetch(`/notes/api/${note.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: newText })
            });
            loadNotes();
        });

        // Delete button
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'remove';
        removeBtn.textContent = 'Șterge';
        removeBtn.addEventListener('click', async () => {
            await fetch(`/notes/api/${note.id}`, { method: 'DELETE' });
            loadNotes();
        });

        actions.appendChild(editBtn);
        actions.appendChild(removeBtn);

        li.appendChild(span);
        li.appendChild(actions);
        listEl.appendChild(li);
    });
}

// Load notes from API
async function loadNotes() {
    try {
        const res = await fetch('/notes/api'); // corect: /notes/api
        if (!res.ok) throw new Error('Eroare la incarcarea notitelor!');
        const notes = await res.json();
        render(Array.isArray(notes) ? notes : []);
    } catch (error) {
        console.error(error);
        listEl.textContent = 'Nu s-au putut incarca notitele!';
    }
}

function escapeHtml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}


function template(t) {
    return `
<li class="item" data-id="${t.id}">
    <label>
        <input class="toggle" type="checkbox" ${t.done ? 'checked' : ''} />
        <span class="text ${t.done ? 'done' : ''}">${escapeHtml(t.text)}</span>
    </label>
    <div class="actions">
        <button class="edit">Editează</button>
        <button class="remove">Șterge</button>
    </div>
</li>`;
}


// Add new note
formEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = inputEl.value.trim();
    if (!text) return;

    await fetch('/notes/api', { // corect: /notes/api
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
    });

    inputEl.value = '';
    loadNotes();
});

// Initial load
loadNotes();

