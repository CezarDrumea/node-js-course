const express = require("express");
const router = express.Router();
const requireLogin = require("../middleware/requireLogin");
const carti = require("../controllers/cartiController");
const validateCarte = require("../middleware/validateCarte");

router.get("/", requireLogin, carti.lista);
router.get("/adauga", requireLogin, carti.showAdd);

// Adăugare carte cu validare Zod
router.post("/adauga", requireLogin, validateCarte, carti.add);

router.post("/citita/:id", requireLogin, carti.toggleCitita);
router.post("/sterge/:id", requireLogin, carti.sterge);

// Modificare carte cu validare Zod
router.get("/modifica/:id", requireLogin, carti.showEdit);
router.post("/modifica/:id", requireLogin, validateCarte, carti.edit);

module.exports = router;
