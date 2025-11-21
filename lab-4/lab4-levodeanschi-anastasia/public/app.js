document.addEventListener('DOMContentLoaded', () => {
    const formEl = document.getElementById('create-form');
    const inputEl = document.getElementById('create-input');
    const listEl = document.getElementById('list');

    if (!formEl || !inputEl || !listEl) return;

    function escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function render(notes) {
        listEl.textContent = '';
        notes.forEach(note => {
            const li = document.createElement('li');
            li.className = 'item';
            li.dataset.id = note.id;
            li.innerHTML = `
                <span class="text">${escapeHtml(note.text)}</span>
                <div class="actions">
                    <button class="edit">Editează</button>
                    <button class="remove">Șterge</button>
                </div>
            `;

            // 🔹 PATCH (editare)
            li.querySelector('.edit').addEventListener('click', async () => {
                const newText = prompt('Editează textul:', note.text);
                if (!newText) return;

                const res = await fetch(`/notes/api/${note.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: newText }),
                    credentials: 'include'
                });

                if (!res.ok) {
                    alert(`Eroare la editare! (${res.status})`);
                    return;
                }

                const updatedNote = await res.json();
                li.querySelector('.text').textContent = updatedNote.text;
                note.text = updatedNote.text;
            });

            // 🔹 DELETE (ștergere)
            li.querySelector('.remove').addEventListener('click', async () => {
                const confirmed = confirm("Sigur vrei să ștergi această notiță?");
                if (!confirmed) return;

                const res = await fetch(`/notes/api/${note.id}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });

                if (!res.ok) {
                    alert(`Eroare la ștergere! (${res.status})`);
                    return;
                }

                li.remove();
            });

            listEl.appendChild(li);
        });
    }

    async function loadNotes() {
        try {
            const res = await fetch('/notes/api', { credentials: 'include' });
            if (res.status === 401) {
                alert('Trebuie să te autentifici!');
                window.location.href = '/auth';
                return;
            }
            if (!res.ok) throw new Error('Eroare la încărcare!');
            const notes = await res.json();
            render(Array.isArray(notes) ? notes : []);
        } catch (err) {
            console.error(err);
            listEl.textContent = 'Nu s-au putut încărca notițele!';
        }
    }

    // 🔹 POST (creare notiță nouă)
    formEl.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = inputEl.value.trim();
        if (!text) return;
        //ștergem erorile existente
        const existingErrors = document.querySelectorAll('.error-message');
        existingErrors.forEach(err => err.remove());

        const res = await fetch('/notes/api', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text }),
            credentials: 'include'
        });


        const result = await res.json();

        if (!res.ok) {

            const p = document.createElement('p');
            p.className = 'error-message';
            p.textContent = result.errors.text;
            formEl.parentNode.insertBefore(p, formEl); // înainte de formular
            return;
        }
        inputEl.value = '';
        loadNotes();
    });

    loadNotes();


});
