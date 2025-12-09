const auth = require("../controllers/authController");

function userFromCookie(req, res, next) {
  const cookie = req.cookies[auth.COOKIE_NAME];
  if (cookie) {
    try {
      req.user = JSON.parse(cookie);
    } catch (err) {
      req.user = null;
    }
  } else {
    req.user = null;
  }
  next();
}

module.exports = userFromCookie;
