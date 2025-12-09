const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

//afiseaza pagina de inregistrare
async function showRegister(req, res) {
  res.render("register", { error: null });
}

//proceseaza inregistrarea
async function register(req, res) {
  const { email, parola } = req.body;
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser)
    return res.render("register", { error: "Email deja folosit!" });

  const hash = bcrypt.hashSync(parola, 10);
  await User.create({ email, parola: hash });

  res.redirect("/login");
}

//afiseaza pagina de login
async function showLogin(req, res) {
  res.render("login", { error: null });
}

//proceseaza login-ul
async function login(req, res) {
  const { email, parola } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) return res.render("login", { error: "Email incorect!" });
  if (!bcrypt.compareSync(parola, user.parola))
    return res.render("login", { error: "Parolă greșită!" });

  //
  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES }
  );

  res.cookie("jwt", token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
  res.redirect("/carti");
}

async function logout(req, res) {
  res.clearCookie("jwt");
  res.redirect("/");
}

module.exports = { showRegister, register, showLogin, login, logout };
