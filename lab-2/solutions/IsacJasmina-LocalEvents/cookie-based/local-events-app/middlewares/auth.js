import { getSessionById } from "../models/authModel.js";

export const requireAuth = async (req, res, next) => {
  try {
    const sessionId = req.cookies.sessionId;
    if (!sessionId) {
      return res.redirect("/login");
    }

    const sessions = await getSessionById(sessionId);
    if (!sessions || sessions.length === 0) {
      return res.redirect("/login");
    }

    req.user = sessions[0].user;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.redirect("/login");
  }
};
