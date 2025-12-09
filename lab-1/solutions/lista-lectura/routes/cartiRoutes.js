const express = require("express");
const router = express.Router();
const requireLogin = require("../middleware/requireLogin");
const carti = require("../controllers/cartiController");

router.get("/", requireLogin, carti.lista);
router.get("/adauga", requireLogin, carti.showAdd);
router.post("/adauga", requireLogin, carti.add);

router.post("/citita/:id", requireLogin, carti.toggleCitita);
router.post("/sterge/:id", requireLogin, carti.sterge);
router.get("/modifica/:id", requireLogin, carti.showEdit);
router.post("/modifica/:id", requireLogin, carti.edit);
module.exports = router;
