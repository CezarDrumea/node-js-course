import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_key";

// Helper function - verifică token-ul
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
};

// Middleware global - doar setează user-ul dacă există
export const setCurrentUser = (req, res, next) => {
  const token = req.cookies.token;
  
  if (token) {
    const decoded = verifyToken(token);
    res.locals.user = decoded;
    req.user = decoded;
  } else {
    res.locals.user = null;
    req.user = null;
  }
  
  next();
};

// Middleware pentru rute protejate - blochează accesul
export const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.redirect("/login");
  }
  
  next();
};

// Verifică dacă user-ul e deja logat
export const redirectIfAuthenticated = (req, res, next) => {
  if (req.user) {
    return res.redirect("/events");
  }
  next();
};