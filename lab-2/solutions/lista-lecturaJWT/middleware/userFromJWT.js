const jwt = require("jsonwebtoken");

function userFromJWT(req, res, next) {
  const token = req.cookies.jwt;

  if (token) {
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      req.user = null;
    }
  } else {
    req.user = null;
  }

  next();
}

module.exports = userFromJWT;
