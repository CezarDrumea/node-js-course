import express from 'express';
import { userModel } from '../models/user_model.js'; // importă instanța clasei

const router = express.Router();

// Folosește metoda createNote din UserModel
router.post('/api', (req, res, next) => userModel.createNote(req, res, next));

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
