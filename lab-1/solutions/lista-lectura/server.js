const express = require("express");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes");
const cartiRoutes = require("./routes/cartiRoutes");
const userFromCookie = require("./middleware/userFromCookie");

const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(userFromCookie);
// Home
app.get("/", (req, res) => {
  res.render("home", { user: req.user });
});

// Rute
app.use("/", authRoutes);
app.use("/carti", cartiRoutes);

app.listen(port, () => console.log(`Server pornit → http://localhost:${port}`));
