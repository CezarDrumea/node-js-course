const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = 4000;

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.render("login");
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));