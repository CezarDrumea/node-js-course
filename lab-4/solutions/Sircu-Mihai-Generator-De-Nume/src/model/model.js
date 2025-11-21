import Name from './Name.js';

export async function names_list() {
  const names = await Name.findAll();
  return names.map((item) => item.name);
}

export async function saved_list() {
  const names = await Name.findAll();
  return names;
}

export async function save(name) {
  const newName = await Name.create({ name });
  return newName;
}

export async function update(id, patch) {
  const [updatedRows] = await Name.update(patch, { where: { id } });
  if (updatedRows === 0) return null;
  return Name.findByPk(id);
}

export async function remove(id) {
  const deletedRows = await Name.destroy({ where: { id } });
  return deletedRows > 0;
}
