import * as model from '../model/model.js';

export async function renderList(req, res, next) {
  try {
    res.render('index', { error: null });
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
    const { name } = req.body;
    if (!name || typeof name !== 'string' || name.trim().length < 1) {
      return res.status(400).json({ error: "'name' is required" });
    }
    const saved_name = await model.save({ name: name.trim() });
    res.status(201).json(saved_name);
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  console.log('Update request received');
  try {
    const { id } = req.params;
    const patch = {};
    if (typeof req.body.name === 'string') patch.name = req.body.name.trim();
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
