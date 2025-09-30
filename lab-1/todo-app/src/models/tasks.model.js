import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:4000' });

export async function list() {
  const { data } = await api.get('/tasks');
  return data;
}

export async function create(todo) {
  const { data } = await api.post('/tasks', todo);
  return data;
}

export async function update(id, patch) {
  if ('done' in patch) {
    patch.done = !!patch.done;
  }

  try {
    const { data } = await api.patch(`/tasks/${encodeURIComponent(id)}`, patch);
    return data;
  } catch (e) {
    if (e.response && e.response.status === 404) return null;
    throw e;
  }
}

export async function remove(id) {
  try {
    await api.delete(`/tasks/${encodeURIComponent(id)}`);
    return true;
  } catch (e) {
    if (e.response && e.response.status === 404) return false;
    throw e;
  }
}
