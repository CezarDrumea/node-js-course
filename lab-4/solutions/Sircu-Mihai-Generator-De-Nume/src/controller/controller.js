import * as model from '../model/model.js';
import { z } from 'zod';

// Zod schema for name validation
const nameSchema = z.object({
  name: z.string().trim().min(1, "'name' is required and must not be empty"),
});

export async function renderList(req, res, next) {
  try {
    const auth = {
      sessionId: req.sessionId || null,
      jwtToken: req.cookies?.jwtToken || null,
      user: req.user || null,
    };
    res.render('index', { error: null, auth });
  } catch (err) {
    next(err);
  }
}

export async function getAll(req, res, next) {
  console.log('Get all request received');
  try {
    const names = await model.names_list();
    res.json(names);
  } catch (err) {
    next(err);
  }
}

export async function getSaved(req, res, next) {
  console.log('Get saved names request received');
  try {
    const names = await model.saved_list();
    res.json(names);
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  console.log('Create request received');
  try {
    // Validates the request body against the nameSchema using Zod.
    const validationResult = nameSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ error: validationResult.error.errors[0].message });
    }
    const { name } = validationResult.data;
    const saved_name = await model.save({ name });
    res.status(201).json(saved_name);
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  console.log('Update request received');
  try {
    const { id } = req.params;
    // Validates the request body against the nameSchema using Zod.
    const validationResult = nameSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ error: validationResult.error.errors[0].message });
    }
    const { name } = validationResult.data;
    const patch = { name };
    const updated = await model.update(id, patch);
    if (!updated) return res.status(404).json({ error: 'Name not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  console.log('Delete request received');
  try {
    const { id } = req.params;
    const ok = await model.remove(id);
    if (!ok) return res.status(404).json({ error: 'Name not found' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
