import express from 'express';
import { z } from 'zod';
import passwordController from '../controllers/passwordController.js';
import { validateBody, validateParams } from '../middleware/validation.js';

const router = express.Router();

const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/),
});

const createPasswordSchema = z.object({
  website: z.string().min(1).max(255),
  username: z.string().min(1).max(255),
  password: z.string().min(1).max(255),
  notes: z.string().max(1000).optional(),
});

const updatePasswordSchema = z.object({
  website: z.string().min(1).max(255),
  username: z.string().min(1).max(255),
  password: z.string().max(255).optional(),
  notes: z.string().max(1000).optional(),
});

router.get('/', passwordController.index);
router.post('/add', validateBody(createPasswordSchema), passwordController.create);
router.post('/reveal/:id', validateParams(idParamSchema), passwordController.reveal);
router.put('/update/:id', validateParams(idParamSchema), validateBody(updatePasswordSchema), passwordController.update);
router.delete('/delete/:id', validateParams(idParamSchema), passwordController.delete);

export default router;