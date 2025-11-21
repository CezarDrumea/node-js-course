import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:4000' });

export async function names_list() {
  const { data } = await api.get('/names');
  return Array.isArray(data) ? data.map((item) => item.name) : [];
}

export async function saved_list() {
  const { data } = await api.get('/saved_names');
  return data;
}

export async function save(name) {
  const { data } = await api.post('/saved_names', name);
  return data;
}

export async function update(id, patch) {
  try {
    const { data } = await api.patch(`/saved_names/${encodeURIComponent(id)}`, patch);
    return data;
  } catch (e) {
    if (e.response && e.response.status === 404) return null;
    throw e;
  }
}

export async function remove(id) {
  try {
    await api.delete(`/saved_names/${encodeURIComponent(id)}`);
    return true;
  } catch (e) {
    if (e.response && e.response.status === 404) return false;
    throw e;
  }
}
