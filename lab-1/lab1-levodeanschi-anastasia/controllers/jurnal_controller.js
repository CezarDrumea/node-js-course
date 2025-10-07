import fs from "fs/promises";
import path from "path";

const dbPath = path.join(process.cwd(), "data/db.json");

// helper functions
const readNotes = async () => {
    try {
        const data = await fs.readFile(dbPath, "utf-8");
        const parsed = JSON.parse(data);
        return Array.isArray(parsed.notite) ? parsed.notite : [];
    } catch (err) {
        return [];
    }
};

const writeNotes = async (notes) => {
    await fs.writeFile(dbPath, JSON.stringify({ notite: notes }, null, 2), "utf-8");
};

export async function listData() {
    const notes = await readNotes();
    return notes;
}

// create note
export async function create(req, res, next) {
    try {
        const { text } = req.body;
        if (!text || typeof text !== "string") {
            return res.status(400).json({ error: "Text invalid" });
        }

        const notes = await readNotes();
        const newNote = { id: Date.now().toString(), text: text.trim() };
        notes.push(newNote);
        await writeNotes(notes);

        res.status(201).json(newNote);
    } catch (err) {
        next(err);
    }
}

// list notes
export async function list(req, res, next) {
    try {
        const notes = await readNotes();
        res.json(notes);
    } catch (err) {
        next(err);
    }
}

// update note
export async function update(req, res, next) {
    try {
        const { id } = req.params;
        const { text } = req.body;
        const notes = await readNotes();
        const noteId = Number(id); // convertim string la număr
        const note = notes.find(n => n.id === noteId);
        if (!note) return res.status(404).json({ error: "Notă nu există" });

        note.text = text.trim();
        await writeNotes(notes);
        res.json(note);
    } catch (err) {
        next(err);
    }
}


// remove note
export async function remove(req, res, next) {
    try {
        const { id } = req.params;
        let notes = await readNotes();
        const initialLength = notes.length;
        notes = notes.filter(n => n.id !== id);
        if (notes.length === initialLength) return res.status(404).json({ error: "Notă nu există" });

        await writeNotes(notes);
        res.status(204).end();
    } catch (err) {
        next(err);
    }
}
