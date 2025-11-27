import express from 'express';
import { z } from 'zod';
import passwordController from '../controllers/passwordController.js';
import { validateBody, validateParams } from '../middleware/validation.js';

const router = express.Router();

// ID parameter validation
const idParamSchema = z.object({
  id: z.string()
    .regex(/^\d+$/, 'ID must be a valid number')
    .transform(val => parseInt(val, 10)),
});

// Create password validation
const createPasswordSchema = z.object({
  website: z.string()
    .min(1, 'Website is required')
    .max(255, 'Website must be 255 characters or less')
    .trim(),
  username: z.string()
    .min(1, 'Username is required')
    .max(255, 'Username must be 255 characters or less')
    .trim(),
  password: z.string()
    .min(1, 'Password is required')
    .max(255, 'Password must be 255 characters or less'),
  notes: z.string()
    .max(1000, 'Notes must be 1000 characters or less')
    .optional(),
});

// Update password validation
const updatePasswordSchema = z.object({
  website: z.string()
    .min(1, 'Website is required')
    .max(255, 'Website must be 255 characters or less')
    .trim(),
  username: z.string()
    .min(1, 'Username is required')
    .max(255, 'Username must be 255 characters or less')
    .trim(),
  password: z.string()
    .max(255, 'Password must be 255 characters or less')
    .optional(),
  notes: z.string()
    .max(1000, 'Notes must be 1000 characters or less')
    .optional(),
});

router.get('/', passwordController.index);
router.post('/add', validateBody(createPasswordSchema), passwordController.create);
router.post('/reveal/:id', validateParams(idParamSchema), passwordController.reveal);
router.put('/update/:id', validateParams(idParamSchema), validateBody(updatePasswordSchema), passwordController.update);
router.delete('/delete/:id', validateParams(idParamSchema), passwordController.delete);

export default router;