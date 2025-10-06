import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../utils/zod-middleware.js';
import { body, param, query, validationResult } from 'express-validator';

const router = Router();

const users = new Map();
let nextId = 1;

const createUserSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  age: z.number().int().gte(13).lte(120).optional(),
  role: z.enum(['student', 'teacher', 'admin']).default('student'),
});

const updateUserSchema = createUserSchema.partial();

const idParamSchema = z.object({ id: z.coerce.number().int().positive() });

const listQuerySchema = z
  .object({
    role: z.enum(['student', 'teacher', 'admin']).optional(),
    minAge: z.coerce.number().int().gte(0).optional(),
    maxAge: z.coerce.number().int().gte(0).optional(),
  })
  .refine((q) => !(q.minAge && q.maxAge) || q.minAge <= q.maxAge, {
    message: 'minAge must be <= maxAge',
    path: ['minAge'],
  });

router.get('/', validate({ query: listQuerySchema }), (req, res) => {
  const { role, minAge, maxAge } = req.valid.query;
  const result = [];
  for (const [, user] of users) {
    if (role && user.role !== role) continue;
    if (typeof minAge === 'number' && (user.age ?? Infinity) < minAge) continue;
    if (typeof maxAge === 'number' && (user.age ?? -Infinity) > maxAge)
      continue;
    result.push(user);
  }
  res.json(result);
});

router.post('/', validate({ body: createUserSchema }), (req, res) => {
  const data = req.valid.body;
  const id = nextId++;
  const user = { id, ...data };
  users.set(id, user);
  res.status(201).json(user);
});

router.get('/:id', validate({ params: idParamSchema }), (req, res) => {
  const { id } = req.valid.params;
  const user = users.get(id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

router.patch(
  '/:id',
  validate({ params: idParamSchema, body: updateUserSchema }),
  (req, res) => {
    const { id } = req.valid.params;
    const existing = users.get(id);
    if (!existing) return res.status(404).json({ message: 'User not found' });
    const updated = { ...existing, ...req.valid.body };
    users.set(id, updated);
    res.json(updated);
  }
);

router.delete('/:id', validate({ params: idParamSchema }), (req, res) => {
  const { id } = req.valid.params;
  const existed = users.delete(id);
  if (!existed) return res.status(404).json({ message: 'User not found' });
  res.status(204).send();
});

router.post(
  '/validator-example',
  [
    body('title').isString().isLength({ min: 3, max: 100 }),
    body('count').optional().isInt({ min: 0, max: 1000 }).toInt(),
    query('draft').optional().isBoolean().toBoolean(),
    param('id').optional().isInt({ min: 1 }).toInt(),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed (express-validator)',
        errors: errors.array(),
      });
    }
    res.json({
      message: 'Valid payload (express-validator)',
      data: {
        title: req.body.title,
        count: req.body.count,
        draft: req.query.draft,
      },
    });
  }
);

export default router;
