import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import prisma from "../lib/prisma.js";

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_key";
const TOKEN_EXPIRES = "1d";

const SALT_ROUNDS = 10;

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(password, salt);
};

// --- SIGNUP ---
export const showSignUpPage = (req, res) => {
  res.render("signup", { errors: null, formData: {} });
};

export const signUpUser = async (req, res) => {
  const { username, password, passwordConfirm } = req.body;

  try {
    const existingUsers = await prisma.user.findMany({
      where: { username }
    });
    
    if (existingUsers.length > 0) {
      return res.render("signup", { 
        errors: { username: "Username deja folosit." },
        formData: { username, password, passwordConfirm }
      });
    }

    const hashedPassword = await hashPassword(password);
    const newUser = await prisma.user.create({
      data: { username, password: hashedPassword }
    });

    const token = jwt.sign(
      { id: newUser.id, username: newUser.username },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRES }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000
    });

    res.redirect("/events");

  } catch (err) {
    console.error("Sign up error:", err);
    res.render("signup", {
      errors: { password: "Eroare server." },
      formData: { username, password, passwordConfirm }
    });
  }
};

// --- LOGIN ---
export const showLoginPage = (req, res) => {
  res.render("login", { errors: null, formData: { } });
};

export const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { username } });

    let isValid = false;

    if (user) {
      isValid = await bcrypt.compare(password, user.password);
    }

    if (!isValid) {
      return res.render("login", { 
        errors: { general: "User sau parola incorecta." }, 
        formData: { username, password }
      });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000
    });

    res.redirect("/events");

  } catch (error) {
    console.error("Login error:", error);
    res.render("login", { errors: { general: "Eroare server." }, formData: { username, password } });
  }
};

// --- LOGOUT ---
export const logoutUser = (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
};
