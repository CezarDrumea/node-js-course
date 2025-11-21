import Name from './Name.js';

export async function names_list() {
  const names = await Name.findAll({ attributes: ['name'] });
  return names.map((item) => item.name);
}

export async function saved_list() {
  const names = await Name.findAll();
  return names;
}

export async function save(name) {
  const newName = await Name.create({ name: name.name });
  return newName;
}

export async function update(id, patch) {
  const [rowsAffected] = await Name.update(patch, { where: { id } });
  if (rowsAffected === 0) return null;
  const updatedName = await Name.findByPk(id);
  return updatedName;
}

export async function remove(id) {
  const rowsAffected = await Name.destroy({ where: { id } });
  return rowsAffected > 0;
}
