import {Router} from 'express';
import * as controller from '../controllers/jurnal_controller.js';

const router = new Router();

router.get("/api", controller.list);
router.post("/api", controller.create);
router.patch("/api/:id", controller.update); // :id - orice valoare apare după /notes/, salveaz-o în req.params.id
router.delete("/api/:id", controller.remove);

export default router;

