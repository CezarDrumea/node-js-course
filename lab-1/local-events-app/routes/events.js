import express from "express";
import multer from "multer";
import upload from "../middlewares/upload.js";
import {
  getEvents,
  getEvent,
  showAddForm,
  showEditForm,
  addEvent,
  editEvent,
  deleteEvent
} from "../controllers/eventsController.js";

const router = express.Router();

router.get("/", getEvents);

// FORMULAR adăugare (GET)
router.get("/add/new", showAddForm);

// ADĂUGARE eveniment (POST) cu tratare erori multer
router.post("/add/new", (req, res, next) => {
  upload.single("image")(req, res, function(err) {
    if (err) {
      return res.status(400).render("eventForm", {
        title: "Adaugă Eveniment",
        event: req.body,
        errors: { image: err.message },
        isEdit: false
      });
    }
    next();
  });
}, addEvent);

// FORMULAR editare (GET)
router.get("/edit/:id", showEditForm);

// SALVARE modificări (POST)
router.put("/edit/:id", (req, res, next) => {
  upload.single("image")(req, res, function(err) {
    if (err) {
      return res.status(400).render("eventForm", {
        title: "Editează Eveniment",
        event: req.body,
        errors: { image: err.message },
        isEdit: true
      }); 
    }
    next();
  });
}, editEvent);

router.get("/:id", getEvent);

router.delete("/:id", deleteEvent);

export default router;
