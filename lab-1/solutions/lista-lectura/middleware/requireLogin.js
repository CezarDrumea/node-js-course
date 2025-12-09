const auth = require("../controllers/authController");

function requireLogin(req, res, next) {
  const cookie = req.cookies[auth.COOKIE_NAME];
  if (!cookie) return res.redirect("/login");

  try {
    req.user = JSON.parse(cookie);
  } catch (err) {
    req.user = null;
    return res.redirect("/login");
  }

  next();
}

module.exports = requireLogin;
