import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import methodOverride from "method-override";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import authRouter from "./routes/auth.js";
import router from "./routes/events.js";
import userRouter from "./routes/user.js";
import { setCurrentUser } from "./middlewares/auth.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Trust Vercel proxy pentru a obține IP-ul real al clientului
app.set('trust proxy', 1);

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-hashes'"],
      scriptSrcAttr: ["'self'", "'unsafe-inline'", "'unsafe-hashes'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
    },
  })
);

// CORS configuration pentru local și production
const allowedOrigins = [
  'http://localhost:3000',
  'https://local-events.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // În producție, poți restricționa acest lucru
    }
  },
  credentials: true
}));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: "Prea multe cereri, încearcă mai târziu.",
    standardHeaders: true,
    legacyHeaders: false,
  })
);

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
