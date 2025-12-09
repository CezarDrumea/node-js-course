const express = require("express");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/authRoutes");
const cartiRoutes = require("./routes/cartiRoutes");
const userFromJWT = require("./middleware/userFromJWT");

require("dotenv").config();

const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.set("views", "./views");
app.use(express.static("public"));

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://cdn.tailwindcss.com", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      },
    },
  })
);

// CORS
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 20, // max 20 cereri
  handler: (req, res) => {
    res.render("login", {
      error: "Prea multe cereri, încearcă din nou mai târziu.",
    });
  },
});
app.use(limiter);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cookieParser());

app.use(express.static("public"));

//JWT Middleware
app.use(userFromJWT);

// Home
app.get("/", (req, res) => {
  res.render("home", { user: req.user });
});

app.use("/", authRoutes);
app.use("/carti", cartiRoutes);

app.use((req, res) => {
  res.status(404).render("404");
});

app.listen(port, () => {
  console.log(`Server pornit → http://localhost:${port}`);
});
