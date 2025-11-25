const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const session = require("express-session");

const app = express();
const PORT = 4000;
const usersFile = path.join(__dirname, "data", "users.json");

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");
    next();
});

app.use(
    session({
        secret: "super_secret_key",
        resave: false,
        saveUninitialized: false,
    })
);

// middleware pentru a verifica loginul
function requireLogin(req, res, next) {
    if (!req.session.user) return res.redirect("/");
    next();
}


// Pagina de login
app.get("/", (req, res) => {
    res.render("login", { error: null });
});

// Login (POST)
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    const users = JSON.parse(fs.readFileSync(usersFile));

    const user = users.find(
        (u) => u.username === username && u.password === password
    );

    if (user) {
        req.session.user = user;
        res.redirect("/dashboard");
    } else {
        res.render("login", { error: "Username sau parola incorecta" });
    }
});

// Pagina de înregistrare
app.get("/register", (req, res) => {
    res.render("register", { error: null });
});

// Înregistrare (POST)
app.post("/register", (req, res) => {
    const { username, password, confirmPassword } = req.body;
    const users = JSON.parse(fs.readFileSync(usersFile));

    // verificam daca userul exista
    if (users.find(u => u.username === username)) {
        return res.render("register", { error: "Utilizatorul exista deja!" });
    }

    // verificam daca parolele sunt identice
    if (password !== confirmPassword) {
        return res.render("register", { error: "Parolele nu coincid!" });
    }

    // optional: validare simpla lungime parola
    if (password.length < 6) {
        return res.render("register", { error: "Parola trebuie sa aiba minim 6 caractere!" });
    }

    const newUser = {
        username,
        password,
        journals: []
    };
    users.push(newUser);
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

    res.redirect("/");
});

// Pagina principală (dashboard)
app.get("/dashboard", requireLogin, (req, res) => {
    const users = JSON.parse(fs.readFileSync(usersFile));
    const user = users.find(u => u.username === req.session.user.username);

    if (user) {
        req.session.user = user; // aducem in sesiune versiunea actualizata
    }

    res.render("dashboard", { user: req.session.user });
});


// Logout
app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.clearCookie("connect.sid"); // cookie-ul sesiunii
        res.redirect("/");
    });
});

function readUsers() {
    return JSON.parse(fs.readFileSync(usersFile));
}

function updateUserInFile(updatedUser) {
    const users = readUsers();
    const index = users.findIndex(u => u.username === updatedUser.username);
    if (index !== -1) {
        users[index] = updatedUser;
        fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
    }
}

// Afisare formular inregistrare noua
app.get("/journal/new", requireLogin, (req, res) => {
    res.render("journal", { isNew: true });
});

// Salvare inregistrare noua in jurnal
app.post("/journal/new", requireLogin, (req, res) => {
    const { title, content } = req.body;
    const users = JSON.parse(fs.readFileSync(usersFile));

    const username = req.session.user.username;
    const userIndex = users.findIndex(u => u.username === username);

    if (userIndex === -1) {
        // ceva nu e ok cu sesiunea – il deconectam
        return res.redirect("/logout");
    }

    // ne asiguram ca exista array-ul
    if (!Array.isArray(users[userIndex].journals)) {
        users[userIndex].journals = [];
    }

    const newEntry = {
        id: Date.now(), // ID simplu, unic
        title,
        content,
        date: new Date().toLocaleString("ro-RO")
    };

    users[userIndex].journals.push(newEntry);
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

    // actualizam si userul din sesiune
    req.session.user = users[userIndex];

    res.redirect("/dashboard");
});

// Afisare o inregistrare de jurnal dupa id
app.get("/journal/:id", requireLogin, (req, res) => {
    const entryId = parseInt(req.params.id, 10);

    // luam userul actualizat din fisier
    const users = JSON.parse(fs.readFileSync(usersFile));
    const user = users.find(u => u.username === req.session.user.username);

    if (!user) {
        return res.redirect("/logout");
    }

    const entry = (user.journals || []).find(j => j.id === entryId);

    if (!entry) {
        // daca nu gasim inregistrarea, intoarcem utilizatorul in dashboard
        return res.redirect("/dashboard");
    }

    // optional, actualizam sesiunea
    req.session.user = user;

    res.render("journal", { isNew: false, entry });
});
// Formular editare inregistrare
app.get("/journal/edit/:id", requireLogin, (req, res) => {
    const entryId = parseInt(req.params.id);
    const users = JSON.parse(fs.readFileSync(usersFile));

    const user = users.find(u => u.username === req.session.user.username);
    if (!user) return res.redirect("/logout");

    const entry = user.journals.find(j => j.id === entryId);
    if (!entry) return res.redirect("/dashboard");

    res.render("journal", { isEdit: true, entry });
});
// Salvare editari
app.post("/journal/edit/:id", requireLogin, (req, res) => {
    const entryId = parseInt(req.params.id);
    const { title, content } = req.body;

    const users = JSON.parse(fs.readFileSync(usersFile));
    const userIndex = users.findIndex(u => u.username === req.session.user.username);

    if (userIndex === -1) return res.redirect("/logout");

    const entry = users[userIndex].journals.find(j => j.id === entryId);

    if (entry) {
        entry.title = title;
        entry.content = content;
    }

    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

    req.session.user = users[userIndex];

    res.redirect("/journal/" + entryId);
});
// Stergere inregistrare
app.get("/journal/delete/:id", requireLogin, (req, res) => {
    const entryId = parseInt(req.params.id);

    const users = JSON.parse(fs.readFileSync(usersFile));
    const userIndex = users.findIndex(u => u.username === req.session.user.username);

    if (userIndex === -1) return res.redirect("/logout");

    users[userIndex].journals = users[userIndex].journals.filter(
        j => j.id !== entryId
    );

    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

    req.session.user = users[userIndex];

    res.redirect("/dashboard");
});



app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));