const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const session = require("express-session");
const helmet = require("helmet");
const cors = require("cors");
const { z } = require("zod");

const { sequelize, User, JournalEntry } = require("./models");

const app = express();
const PORT = 4004; // alt port fata de celelalte lab-uri

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// securitate HTTP headers
app.use(helmet());

// CORS (permite accesul din alte origini, ex. daca ai avea frontend separat)
app.use(cors());

// sesiune
app.use(
    session({
        secret: "super_secret_key",
        resave: false,
        saveUninitialized: false,
    })
);

// dezactivam cache
app.use((req, res, next) => {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");
    next();
});

// middleware pentru a verifica login-ul
function requireLogin(req, res, next) {
    if (!req.session.userId) return res.redirect("/");
    next();
}

/* ======== SCHEME ZOD ======== */

const registerSchema = z
    .object({
        username: z
            .string()
            .min(3, "Username-ul trebuie sa aiba minim 3 caractere"),
        password: z
            .string()
            .min(6, "Parola trebuie sa aiba minim 6 caractere"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Parolele nu coincid!",
        path: ["confirmPassword"],
    });

const loginSchema = z.object({
    username: z.string().min(1, "Username obligatoriu"),
    password: z.string().min(1, "Parola obligatorie"),
});

const journalSchema = z.object({
    title: z.string().min(3, "Titlul trebuie sa aiba minim 3 caractere"),
    content: z.string().min(5, "Continutul trebuie sa aiba minim 5 caractere"),
});

/* ======== AUTH ======== */

// Pagina de login
app.get("/", (req, res) => {
    res.render("login", { error: null });
});

// Login (POST)
app.post("/login", async (req, res) => {
    try {
        const { username, password } = loginSchema.parse(req.body);

        const user = await User.findOne({ where: { username, password } });

        if (!user) {
            return res.render("login", { error: "Username sau parola incorecta" });
        }

        req.session.userId = user.id;
        res.redirect("/dashboard");
    } catch (err) {
        console.error(err);
        let message = "Eroare la autentificare";

        if (err instanceof z.ZodError) {
            message = err.errors[0].message;
        }

        res.render("login", { error: message });
    }
});

// Pagina de inregistrare
app.get("/register", (req, res) => {
    res.render("register", { error: null });
});

// Inregistrare (POST)
app.post("/register", async (req, res) => {
    try {
        const { username, password, confirmPassword } = registerSchema.parse(
            req.body
        );

        const existing = await User.findOne({ where: { username } });
        if (existing) {
            return res.render("register", { error: "Utilizatorul exista deja!" });
        }

        await User.create({ username, password });

        res.redirect("/");
    } catch (err) {
        console.error(err);
        let message = "Eroare la inregistrare";

        if (err instanceof z.ZodError) {
            message = err.errors[0].message;
        }

        res.render("register", { error: message });
    }
});

// Logout
app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
});

/* ======== DASHBOARD ======== */

app.get("/dashboard", requireLogin, async (req, res) => {
    try {
        const user = await User.findByPk(req.session.userId, {
            include: [{ model: JournalEntry }],
            order: [[JournalEntry, "createdAt", "DESC"]],
        });

        if (!user) {
            return res.redirect("/logout");
        }

        const plainUser = {
            id: user.id,
            username: user.username,
            journals: user.JournalEntries || [],
        };

        res.render("dashboard", { user: plainUser });
    } catch (err) {
        console.error(err);
        res.redirect("/");
    }
});

/* ======== JURNAL ======== */

// Formular inregistrare noua
app.get("/journal/new", requireLogin, (req, res) => {
    res.render("journal", { isNew: true });
});

// Creare inregistrare
app.post("/journal/new", requireLogin, async (req, res) => {
    try {
        const { title, content } = journalSchema.parse(req.body);

        const user = await User.findByPk(req.session.userId);
        if (!user) return res.redirect("/logout");

        await JournalEntry.create({
            title,
            content,
            date: new Date().toLocaleString("ro-RO"),
            userId: user.id,
        });

        res.redirect("/dashboard");
    } catch (err) {
        console.error(err);
        let message = "Eroare la salvarea inregistrarii";

        if (err instanceof z.ZodError) {
            message = err.errors[0].message;
        }

        // Reafisam formularul cu eroare
        res.render("journal", { isNew: true, error: message });
    }
});

// Afisare inregistrare
app.get("/journal/:id", requireLogin, async (req, res) => {
    const entryId = parseInt(req.params.id, 10);

    try {
        const entry = await JournalEntry.findOne({
            where: { id: entryId, userId: req.session.userId },
        });

        if (!entry) {
            return res.redirect("/dashboard");
        }

        res.render("journal", { isNew: false, entry });
    } catch (err) {
        console.error(err);
        res.redirect("/dashboard");
    }
});

// Formular editare
app.get("/journal/edit/:id", requireLogin, async (req, res) => {
    const entryId = parseInt(req.params.id, 10);

    try {
        const entry = await JournalEntry.findOne({
            where: { id: entryId, userId: req.session.userId },
        });

        if (!entry) return res.redirect("/dashboard");

        res.render("journal", { isEdit: true, entry });
    } catch (err) {
        console.error(err);
        res.redirect("/dashboard");
    }
});

// Salvare editare
app.post("/journal/edit/:id", requireLogin, async (req, res) => {
    const entryId = parseInt(req.params.id, 10);

    try {
        const { title, content } = journalSchema.parse(req.body);

        const entry = await JournalEntry.findOne({
            where: { id: entryId, userId: req.session.userId },
        });

        if (!entry) return res.redirect("/dashboard");

        entry.title = title;
        entry.content = content;
        await entry.save();

        res.redirect("/journal/" + entryId);
    } catch (err) {
        console.error(err);
        let message = "Eroare la editare";

        if (err instanceof z.ZodError) {
            message = err.errors[0].message;
        }

        res.render("journal", {
            isEdit: true,
            entry: { id: entryId, title: req.body.title, content: req.body.content },
            error: message,
        });
    }
});

// Stergere inregistrare
app.get("/journal/delete/:id", requireLogin, async (req, res) => {
    const entryId = parseInt(req.params.id, 10);

    try {
        await JournalEntry.destroy({
            where: { id: entryId, userId: req.session.userId },
        });

        res.redirect("/dashboard");
    } catch (err) {
        console.error(err);
        res.redirect("/dashboard");
    }
});

//pornire server si sync la db

(async () => {
    try {
        await sequelize.sync();
        app.listen(PORT, () => {
            console.log(`Lab4 app running on http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error("Eroare la sincronizarea DB:", err);
    }
})();
