import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import methodOverride from "method-override";
import router from "./routes/events.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Folosim resursele din folderul public fara a fi nevoie de rute
app.use(express.static(path.join(__dirname, "public")));

// Body parsing pentru formulare
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

app.use("/events", router);

app.get("/", (req, res) => {
  res.redirect("/events");
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server pornit pe http://localhost:${PORT}`);
});
