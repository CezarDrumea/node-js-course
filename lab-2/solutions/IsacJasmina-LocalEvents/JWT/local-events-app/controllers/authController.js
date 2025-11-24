import jwt from "jsonwebtoken";
import {
  findUser,
  findUserByUsername,
  createUser
} from "../models/authModel.js";

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_key";
const TOKEN_EXPIRES = "1d"; // 1 zi

// --- SIGNUP ---
export const showSignUpPage = (req, res) => {
  res.render("signup", { error: null, formData: {} });
};

export const signUpUser = async (req, res) => {
  const { username, password, passwordConfirm } = req.body;

  try {
    if (!username?.trim() || !password?.trim()) {
      return res.render("signup", { 
        error: "Completează toate câmpurile.",
        formData: { username, password, passwordConfirm }
      });
    }

    if (password !== passwordConfirm) {
      return res.render("signup", { 
        error: "Parolele nu coincid.",
        formData: { username, password, passwordConfirm }
      });
    }

    const existingUsers = await findUserByUsername(username);
    if (existingUsers.length > 0) {
      return res.render("signup", { 
        error: "Username deja folosit.",
        formData: { username, password, passwordConfirm }
      });
    }

    const newUser = await createUser(username, password);

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
      error: "Eroare server.",
      formData: { username, password, passwordConfirm }
    });
  }
};

// --- LOGIN ---
export const showLoginPage = (req, res) => {
  res.render("login", { error: null, formData: { } });
};

export const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const users = await findUser(username, password);

    if (users.length === 0) {
      return res.render("login", { error: "User sau parola incorecta.", formData: { username, password } });
    }

    const user = users[0];

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
    res.render("login", { error: "Eroare server.", formData: { username, password } });
  }
};

// --- LOGOUT ---
export const logoutUser = (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
};
