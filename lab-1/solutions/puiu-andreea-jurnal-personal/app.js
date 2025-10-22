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
    const { username, password } = req.body;
    const users = JSON.parse(fs.readFileSync(usersFile));

    if (users.find((u) => u.username === username)) {
        return res.render("register", { error: "Utilizatorul exista deja!" });
    }

    const newUser = { username, password, journals: [] };
    users.push(newUser);
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

    res.redirect("/");
});

// Pagina principală (dashboard)
app.get("/dashboard", requireLogin, (req, res) => {
    res.render("dashboard", { user: req.session.user });
});

// Logout
app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
});


app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));