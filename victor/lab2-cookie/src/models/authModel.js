import axios from 'axios';
import crypto from 'crypto';

const API_URL = 'http://localhost:3001';
const api = axios.create({ baseURL: API_URL });

export const cookieOptions = {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    // secure: true,
    // maxAge: 1000 * 60 * 60
};

export const isNonEmpty = (s) =>
    typeof s === 'string' && s.trim().length > 0;

export async function findUserExact(username, password) {
    if (!isNonEmpty(username) || !isNonEmpty(password)) return null;

    const { data } = await api.get('/users', {
        params: { username, password },
    });

    return Array.isArray(data) ? data.find((u) => u.username === username && u.password === password) || null : null;
}

export async function getSessionById(sessionId) {
    const { data } = await api.get('/sessions', {
        params: { id: sessionId },
    });

    return Array.isArray(data) && data.length ? data[0] : null;
}

export async function createSession(userId) {
    const sessionId = crypto.randomUUID();
    const { data } = await api.post('/sessions', {
        id: sessionId,
        userId,
        createdAt: new Date().toISOString(),
    });
    return { sessionId, session: data };
}

export async function deleteSession(sessionId) {
    await api.delete(`/sessions/${sessionId}`);
}

export async function getUserById(userId) {
    const { data } = await api.get(`/users/${userId}`);
    return data;
}