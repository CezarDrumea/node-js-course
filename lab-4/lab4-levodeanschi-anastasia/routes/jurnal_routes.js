import express from 'express';
import { userModel } from '../models/user_model.js';
import {notesValidator} from "../validators/notesValidator.js";
import {Note} from '../controllers/jurnal_controller.js';
const router = express.Router();

// Folosește metoda createNote din UserModel
// POST /api/notes
router.post('/api', async (req, res) => {
    try {
        const cookieUser = req.cookies.user ? JSON.parse(req.cookies.user) : null;
        if (!cookieUser) return res.status(401).json({ error: 'Nu ești logat!' });

        const result = notesValidator.safeParse(req.body);
        if (!result.success) {
            const errors = {};
            result.error.issues.forEach(issue => {
                errors[issue.path[0]] = issue.message;
            });
            return res.status(400).json({ errors });
        }

        const note = await Note.create({
            user_id: cookieUser.id,
            text: result.data.text
        });

        res.status(201).json(note);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Eroare server' });
    }
});

router.get('/api', async (req, res, next) => {
    try {
        const cookieUser = JSON.parse(req.cookies.user);
        const notes = await userModel.getUserNotes(cookieUser.login);
        res.json(notes);
    } catch (err) {
        next(err);
    }
});

router.patch('/api/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { text } = req.body;
        const note = await userModel.addNoteForUser(JSON.parse(req.cookies.user).login, text);
        res.json(note);
    } catch (err) {
        next(err);
    }
});

router.delete('/api/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        await userModel.removeNote(id); // adaugă funcție removeNote în UserModel dacă nu există
        res.status(204).end();
    } catch (err) {
        next(err);
    }
});

export default router;
