import { Sequelize, DataTypes } from "sequelize";
import path from "path";
import { notesValidator } from "../validators/notesValidator.js";
const dbPath = path.join(process.cwd(), "data/notes.db");

const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: dbPath,
    logging: true,
});

const User = sequelize.define("User", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    login: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    password: { type: DataTypes.STRING(50), allowNull: false }
}, { tableName: "users", timestamps: false });

export const Note = sequelize.define("Notita", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    text: { type: DataTypes.TEXT, allowNull: false },
    user_id: { type: DataTypes.INTEGER, references: { model: User, key: "id" } }
}, { tableName: "notite", timestamps: false });

// Relație
User.hasMany(Note, { foreignKey: "user_id" });
Note.belongsTo(User, { foreignKey: "user_id" });

async function initDB() {
    try {
        await sequelize.authenticate();
        console.log("Conectat la bd Sqlite");

        // Crează tabelele doar dacă nu există, nu recreează nimic
        await sequelize.sync({ force: false, alter: false });
        console.log("Tabelele `users` și `notite` sunt gata");

    } catch (err) {
        console.error("Eroare la inițializare DB:", err);
    }
}

initDB();

// helper functions

export async function listData() {
  return await Note.findAll();
}




// list notes
export async function list(req, res, next) {
    try {
        const notes = await Note.findAll();
        res.json(notes);
    } catch (err) {
        next(err);
    }
}

// UPDATE note
export async function update(req, res, next) {
    try {
        const { id } = req.params;
        const { text } = req.body;
        const note = await Note.findByPk(id);
        if (!note) return res.status(404).json({ error: "Notă nu există" });

        note.text = text.trim();
        await note.save(); // salvăm modificarea
        res.json(note);    // trimitem nota actualizată
    } catch (err) {
        next(err);
    }
}

// DELETE note
export async function remove(req, res, next) {
    try {
        const { id } = req.params;
        const deleted = await Note.destroy({ where: { id } }); // ștergem direct din DB
        if (deleted === 0) return res.status(404).json({ error: "Notă inexistentă!" });
        res.status(204).end();
    } catch (err) {
        next(err);
    }
}

// POST create note


export const create = async (req, res) => {
    const cookieUser = req.cookies.user ? JSON.parse(req.cookies.user) : null;
    if (!cookieUser) return res.status(401).json({ error: 'Nu ești logat!' });

    const result = notesValidator.safeParse(req.body);

    if (!result.success) {
        const errors = result.error.issues.reduce((acc, issue) => {
            acc[issue.path[0]] = issue.message;
            return acc;
        }, {});
        return res.status(400).json({ errors });
    }

    const { text } = result.data;
    const note = await Note.create({ user_id: cookieUser.id, text });
    res.json(note);
};

export const ensureAuth = (req, res, next) => {
    // Verificăm dacă e request la API sau pagină normală
    const isApi = req.originalUrl.startsWith('/notes/api');
    if (!req.cookies.user) {
        if (isApi) {
            return res.status(401).json({ error: 'Nu ești logat!' }); }
        else { return res.redirect('/auth'); } } next();
}
