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
import { checkEventOwnership } from "../middlewares/checkOwnership.js";
import { validate, validateImage } from "../middlewares/eventValidate.js";
import { eventSchema, eventEditSchema } from "../schemas/eventSchema.js";

const router = express.Router();

router.get("/", getEvents);

router.get("/add/new", requireAuth, showAddForm);

router.post(
  "/add/new",
  requireAuth,
  upload.single("image"),
  validate(eventSchema, { isEdit: false }),
  validateImage({ isEdit: false }),
  addEvent
);

router.get("/edit/:id", requireAuth, checkEventOwnership, showEditForm);

router.put(
  "/:id",
  requireAuth,
  checkEventOwnership,
  upload.single("image"),
  validate(eventEditSchema, { isEdit: true }),
  validateImage({ isEdit: true }),
  editEvent
);

router.get("/:id", getEvent);

router.delete("/:id", requireAuth, checkEventOwnership, deleteEvent);

export default router;
