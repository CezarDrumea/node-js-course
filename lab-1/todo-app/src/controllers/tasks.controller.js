import * as model from '../models/tasks.model.js';

// Server-side rendered page
export async function renderList(req, res, next) {
  try {
    const tasks = await model.list();
    res.render('index', { tasks, error: null });
  } catch (err) {
    next(err);
  }
}

// JSON endpoints (used by client-side fetch)
export async function getAll(req, res, next) {
  try {
    const tasks = await model.list();
    res.json(tasks);
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string' || text.trim().length < 1) {
      return res.status(400).json({ error: "'text' is required" });
    }
    const todo = await model.create({ text: text.trim(), done: false });
    res.status(201).json(todo);
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const { id } = req.params;
    const patch = {};
    if (typeof req.body.text === 'string') patch.text = req.body.text.trim();
    if ('done' in req.body) {
      patch.done = req.body.done === true || req.body.done === 'true';
    }
    const updated = await model.update(id, patch);
    if (!updated) return res.status(404).json({ error: 'Task not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const { id } = req.params;
    const ok = await model.remove(id);
    if (!ok) return res.status(404).json({ error: 'Task not found' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
