import crypto from "crypto";
import {
  findUser,
  findUserByUsername,
  createUser,
  createSession,
  deleteSession
} from "../models/authModel.js";

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

    const sessionId = crypto.randomUUID();
    await createSession(sessionId, newUser);

    res.cookie("sessionId", sessionId, {
      httpOnly: true,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000 // 1 zi
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
  res.render("login", { error: null });
};

export const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const users = await findUser(username, password);

    if (users.length === 0) {
      return res.render("login", { error: "User sau parola incorecta." });
    }

    const user = users[0];
    const sessionId = crypto.randomUUID();

    await createSession(sessionId, user);

    res.cookie("sessionId", sessionId, {
      httpOnly: true,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000 // 1 zi
    });

    res.redirect("/events");

  } catch (error) {
    console.error("Login error:", error);
    res.render("login", { error: "Eroare server." });
  }
};

// --- LOGOUT ---
export const logoutUser = async (req, res) => {
  const sessionId = req.cookies.sessionId;

  try {
    if (sessionId) {
      await deleteSession(sessionId);
    }
  } catch (err) {
    console.error("Logout error:", err);
  }

  res.clearCookie("sessionId");
  res.redirect("/login");
};
