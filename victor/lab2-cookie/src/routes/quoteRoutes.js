import { Router } from "express";
import * as controller from '../controllers/quoteController.js';

const router = Router();

router.get('/', controller.listQuotes);
router.get('/new', controller.showCreateForm);
router.post('/', controller.createQuote);
router.get('/:id', controller.showQuote);
router.get('/:id/edit', controller.showEditForm);
router.post('/:id', controller.updateQuote);
router.post('/:id/delete', controller.deleteQuote);

export default router;
