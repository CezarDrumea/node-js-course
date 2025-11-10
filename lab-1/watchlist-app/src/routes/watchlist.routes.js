import express from 'express';
import * as controller from '../controllers/watchlist.controller.js';

const router = express.Router();

router.get('/', controller.showWatchlist);
router.post('/', controller.createItem);

router.post('/delete/:id', controller.removeItem);
router.post('/toggle/:id', controller.toggleWatchedStatus);

router.get('/edit/:id', controller.showEditForm);
router.post('/edit/:id', controller.saveEdit);

export default router;