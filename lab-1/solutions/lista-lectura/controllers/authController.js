const bcrypt = require("bcrypt");
const { getUsers, saveUsers } = require("../models/users");

const COOKIE_NAME = "user_cookie";

// afiseaza formularul de inregistrare
function showRegister(req, res) {
  res.render("register", { error: null });
}

//inregistreaza un utilizator nou
function register(req, res) {
  const users = getUsers();
  if (users.find((u) => u.email === req.body.email))
    return res.render("register", { error: "Email deja folosit!" });

  const newUser = {
    id: Date.now(),
    email: req.body.email,
    parola: bcrypt.hashSync(req.body.parola, 10),
  };
  users.push(newUser);
  saveUsers(users);

  res.redirect("/login");
}
// afiseaza formularul de login
function showLogin(req, res) {
  res.render("login", { error: null });
}

//functia pentru autentificare utilizatorului
function login(req, res) {
  const users = getUsers();
  const user = users.find((u) => u.email === req.body.email);
  if (!user) return res.render("login", { error: "Email incorect!" });
  if (!bcrypt.compareSync(req.body.parola, user.parola))
    return res.render("login", { error: "Parolă greșită!" });

  const cookieData = { id: user.id, email: user.email };
  res.cookie(COOKIE_NAME, JSON.stringify(cookieData), {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, //1zi
  });

  res.redirect("/carti");
}

function logout(req, res) {
  res.clearCookie(COOKIE_NAME);
  res.redirect("/");
}

module.exports = {
  showRegister,
  register,
  showLogin,
  login,
  logout,
  COOKIE_NAME,
};
