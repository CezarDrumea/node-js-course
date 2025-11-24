import express from "express";
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
import { requireAuth } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", getEvents);

router.get("/add/new", requireAuth, showAddForm);

router.post("/add/new", requireAuth, (req, res, next) => {
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

router.get("/edit/:id", requireAuth, showEditForm);

router.put("/:id", requireAuth, (req, res, next) => {
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

router.get("/:id", requireAuth, getEvent);

router.delete("/:id", requireAuth, deleteEvent);

export default router;
