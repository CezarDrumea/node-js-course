import axios from 'axios';

const API_URL = 'http://localhost:3001';
const api = axios.create({ baseURL: API_URL });

export const isNonEmpty = (s) =>
    typeof s === 'string' && s.trim().length > 0;

export async function findUserExact(username, password) {
    if (!isNonEmpty(username) || !isNonEmpty(password)) return null;

    const { data } = await api.get('/users', {
        params: { username, password },
    });

    return Array.isArray(data) ? data.find((u) => u.username === username && u.password === password) || null : null;
}