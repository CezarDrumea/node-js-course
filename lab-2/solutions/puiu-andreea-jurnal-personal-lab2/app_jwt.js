const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = 4001;
const usersFile = path.join(__dirname, "data", "users.json");
const SECRET_KEY = "jwt_secret_key";

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// dezactivam cache
app.use((req, res, next) => {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");
    next();
});

// helperi pentru users
function readUsers() {
    return JSON.parse(fs.readFileSync(usersFile));
}

function writeUsers(users) {
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}

// middleware JWT
function requireLogin(req, res, next) {
    const token = req.cookies.token;

    if (!token) return res.redirect("/");

    try {
        const payload = jwt.verify(token, SECRET_KEY);
        const users = readUsers();
        const user = users.find(u => u.username === payload.username);

        if (!user) return res.redirect("/");

        req.user = user;
        next();
    } catch (err) {
        console.log("Token invalid:", err.message);
        return res.redirect("/");
    }
}

/* ======== AUTH ======== */

// Pagina de login
app.get("/", (req, res) => {
    res.render("login", { error: null });
});

// Login (POST)
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    const users = readUsers();

    const user = users.find(
        u => u.username === username && u.password === password
    );

    if (!user) {
        return res.render("login", { error: "Username sau parola incorecta" });
    }

    const token = jwt.sign(
        { username: user.username },
        SECRET_KEY,
        { expiresIn: "1h" }
    );

    res.cookie("token", token, {
        httpOnly: true,
        sameSite: "lax"
    });

    res.redirect("/dashboard");
});

// Pagina de înregistrare
app.get("/register", (req, res) => {
    res.render("register", { error: null });
});

// Înregistrare (POST)
app.post("/register", (req, res) => {
    const { username, password, confirmPassword } = req.body;
    const users = readUsers();

    if (users.find(u => u.username === username)) {
        return res.render("register", { error: "Utilizatorul exista deja!" });
    }

    if (password !== confirmPassword) {
        return res.render("register", { error: "Parolele nu coincid!" });
    }

    if (password.length < 6) {
        return res.render("register", { error: "Parola trebuie sa aiba minim 6 caractere!" });
    }

    const newUser = {
        username,
        password,
        journals: []
    };

    users.push(newUser);
    writeUsers(users);

    res.redirect("/");
});

// Logout
app.get("/logout", (req, res) => {
    res.clearCookie("token");
    res.redirect("/");
});

/* ======== DASHBOARD ======== */

app.get("/dashboard", requireLogin, (req, res) => {
    // recitim userul actualizat din fisier
    const users = readUsers();
    const user = users.find(u => u.username === req.user.username) || req.user;

    res.render("dashboard", { user });
});

/* ======== JURNAL ======== */

// Afisare formular inregistrare noua
app.get("/journal/new", requireLogin, (req, res) => {
    res.render("journal", { isNew: true });
});

// Salvare inregistrare noua in jurnal
app.post("/journal/new", requireLogin, (req, res) => {
    const { title, content } = req.body;
    const users = readUsers();

    const userIndex = users.findIndex(u => u.username === req.user.username);
    if (userIndex === -1) return res.redirect("/logout");

    if (!Array.isArray(users[userIndex].journals)) {
        users[userIndex].journals = [];
    }

    const newEntry = {
        id: Date.now(),
        title,
        content,
        date: new Date().toLocaleString("ro-RO")
    };

    users[userIndex].journals.push(newEntry);
    writeUsers(users);

    res.redirect("/dashboard");
});

// Afisare o inregistrare de jurnal dupa id
app.get("/journal/:id", requireLogin, (req, res) => {
    const entryId = parseInt(req.params.id, 10);
    const users = readUsers();
    const user = users.find(u => u.username === req.user.username);

    if (!user) return res.redirect("/logout");

    const entry = (user.journals || []).find(j => j.id === entryId);
    if (!entry) return res.redirect("/dashboard");

    res.render("journal", { isNew: false, entry });
});

// Formular editare inregistrare
app.get("/journal/edit/:id", requireLogin, (req, res) => {
    const entryId = parseInt(req.params.id, 10);
    const users = readUsers();
    const user = users.find(u => u.username === req.user.username);

    if (!user) return res.redirect("/logout");

    const entry = (user.journals || []).find(j => j.id === entryId);
    if (!entry) return res.redirect("/dashboard");

    res.render("journal", { isEdit: true, entry });
});

// Salvare editari
app.post("/journal/edit/:id", requireLogin, (req, res) => {
    const entryId = parseInt(req.params.id, 10);
    const { title, content } = req.body;

    const users = readUsers();
    const userIndex = users.findIndex(u => u.username === req.user.username);
    if (userIndex === -1) return res.redirect("/logout");

    const entry = users[userIndex].journals.find(j => j.id === entryId);
    if (entry) {
        entry.title = title;
        entry.content = content;
    }

    writeUsers(users);

    res.redirect("/journal/" + entryId);
});

// Stergere inregistrare
app.get("/journal/delete/:id", requireLogin, (req, res) => {
    const entryId = parseInt(req.params.id, 10);

    const users = readUsers();
    const userIndex = users.findIndex(u => u.username === req.user.username);
    if (userIndex === -1) return res.redirect("/logout");

    users[userIndex].journals = (users[userIndex].journals || []).filter(
        j => j.id !== entryId
    );

    writeUsers(users);

    res.redirect("/dashboard");
});

app.listen(PORT, () => {
    console.log(`JWT app running on http://localhost:${PORT}`);
});
