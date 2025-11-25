import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import methodOverride from "method-override";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRouter from "./routes/auth.js";
import router from "./routes/events.js";
import { setCurrentUser } from "./middlewares/auth.js";
import userRouter from "./routes/user.js";

dotenv.config();

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

app.use(setCurrentUser);

app.use("/events", router);
app.use("/", authRouter);
app.use("/", userRouter);

app.get("/", (req, res) => {
  res.redirect("/events");
});

const PORT = 3000 ;
app.listen(PORT, () => {
  console.log(`Server pornit pe http://localhost:${PORT}`);
});
