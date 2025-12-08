const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const session = require("express-session");

const { sequelize, User, JournalEntry } = require("./models");

const app = express();
const PORT = 4003; // alt port fata de lab1/lab2

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

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

/* ======== AUTH ======== */

// Pagina de login
app.get("/", (req, res) => {
    res.render("login", { error: null });
});

// Login (POST)
app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ where: { username, password } });

        if (!user) {
            return res.render("login", { error: "Username sau parola incorecta" });
        }

        req.session.userId = user.id;
        res.redirect("/dashboard");
    } catch (err) {
        console.error(err);
        res.render("login", { error: "Eroare la autentificare" });
    }
});

// Pagina de inregistrare
app.get("/register", (req, res) => {
    res.render("register", { error: null });
});

// Inregistrare (POST)
app.post("/register", async (req, res) => {
    const { username, password, confirmPassword } = req.body;

    try {
        const existing = await User.findOne({ where: { username } });
        if (existing) {
            return res.render("register", { error: "Utilizatorul exista deja!" });
        }

        if (password !== confirmPassword) {
            return res.render("register", { error: "Parolele nu coincid!" });
        }

        if (password.length < 6) {
            return res.render("register", {
                error: "Parola trebuie sa aiba minim 6 caractere!",
            });
        }

        await User.create({ username, password });

        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.render("register", { error: "Eroare la inregistrare" });
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
    const { title, content } = req.body;

    try {
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
        res.redirect("/dashboard");
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
    const { title, content } = req.body;

    try {
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
        res.redirect("/dashboard");
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

/* ==== PORNIRE SERVER + SYNC DB ==== */

(async () => {
    try {
        await sequelize.sync(); // sau { alter: true } daca modifici modelele
        app.listen(PORT, () => {
            console.log(`Lab3 app running on http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error("Eroare la sincronizarea DB:", err);
    }
})();
