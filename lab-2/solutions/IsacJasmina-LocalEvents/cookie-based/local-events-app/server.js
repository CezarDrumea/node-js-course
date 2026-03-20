import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import methodOverride from "method-override";
import router from "./routes/events.js";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.js";
import { getSessionById } from "./models/authModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

app.use(cookieParser());

// Middleware global pentru user
app.use(async (req, res, next) => {
  const sessionId = req.cookies.sessionId;
  if (sessionId) {
    const sessions = await getSessionById(sessionId);
    if (sessions.length > 0) {
      res.locals.user = sessions[0].user;
    } else {
      res.locals.user = null;
    }
  } else {
    res.locals.user = null;
  }
  next();
});

app.use("/events", router);
app.use("/", authRouter);

app.get("/", (req, res) => {
  res.redirect("/events");
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server pornit pe http://localhost:${PORT}`);
});
