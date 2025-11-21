import { Sequelize, DataTypes, Op } from "sequelize";
import path from "path";
import {notesValidator} from "../validators/notesValidator.js";

const dbPath = path.join(process.cwd(), "data/notes.db");

const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: dbPath,
    logging: true,
});

const User = sequelize.define("User", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    login: { type: DataTypes.STRING(50), unique: true, allowNull: false },
    password: { type: DataTypes.STRING(50), allowNull: false }
}, {
    tableName: "users",
    timestamps: false,
});

const Notita = sequelize.define("Notita", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    text: { type: DataTypes.TEXT, allowNull: false },
    user_id: { type: DataTypes.INTEGER, references: { model: User, key: "id" } }
}, {
    tableName: "notite",
    timestamps: false,
});

// Relații
User.hasMany(Notita, { foreignKey: "user_id" });
Notita.belongsTo(User, { foreignKey: "user_id" });

export class UserModel {
    constructor() {
        sequelize.authenticate()
            .then(() => console.log("Conectat la bd Sqlite"))
            .then(() => sequelize.sync())
            .then(() => console.log("Tabele sincronizate"))
            .catch(err => console.error(err));
    }

    // Găsește user după login
    async findUser(login) {
        return await User.findOne({ where: { login } });
    }

    // Creează user nou
    async addUser(user) {
        return await User.create(user);
    }

    // Autentificare user
    async authenticate(login, password) {
        const user = await User.findOne({ where: { [Op.and]: [{ login }, { password }] } });
        return user ? user.toJSON() : null;
    }

    // Obține toate notițele unui user
    async getUserNotes(login) {
        const user = await this.findUser(login);
        if (!user) return null;
        return await Notita.findAll({ where: { user_id: user.id } });
    }

    // Adaugă notiță pentru un user
    async addNoteForUser(login, text) {
        const user = await this.findUser(login);
        if (!user) throw new Error("Utilizatorul nu există!");
        return await Notita.create({ text, user_id: user.id });
    }

    // Update notiță
    async updateNote(id, text) {
        const note = await Notita.findByPk(id);
        if (!note) throw new Error("Notița nu există!");
        note.text = text;
        await note.save();
        return note;
    }

    // Ștergere notiță
    async removeNote(id) {
        const deleted = await Notita.destroy({ where: { id } });
        if (deleted === 0) throw new Error("Notița nu există!");
        return true;
    }

    // Middleware pentru crearea notițelor
    async createNote(req, res, next) {
        try {
            if (!req.cookies.user) {
                return res.status(401).json({ error: "Nu ești logat!" });
            }

            const cookieUser = JSON.parse(req.cookies.user);

            // Aplicăm validatorul Zod
            const result = notesValidator.safeParse(req.body);

            if (!result.success) {
                const errors = result.error.issues.map(issue => issue.message);
                return res.status(400).json({ errors });
            }

            // Folosim textul validat de Zod
            const { text } = result.data;

            const note = await this.addNoteForUser(cookieUser.login, text);

            console.log("Notă creată:", note);

            res.status(201).json(note);
        } catch (err) {
            console.error("Eroare la crearea notiței:", err);
            next(err);
        }
    }
}

export const userModel = new UserModel();
