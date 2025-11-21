import axios from 'axios';
import crypto from 'crypto';

const JSON_SERVER_URL = 'http://localhost:4000';

const isNonEmpty = (s) => typeof s === 'string' && s.trim().length > 0;

export async function findUserExact(username, password) {
  if (!isNonEmpty(username) || !isNonEmpty(password)) return null;
  const { data } = await axios.get(`${JSON_SERVER_URL}/users`, {
    params: { username, password },
  });
  return Array.isArray(data)
    ? data.find((u) => u.username === username && u.password === password) ||
        null
    : null;
}

export async function getSessionById(sessionId) {
  const { data } = await axios.get(`${JSON_SERVER_URL}/sessions`, {
    params: { id: sessionId },
  });
  return Array.isArray(data) && data.length ? data[0] : null;
}

export async function deleteSession(sessionId) {
  await axios.delete(`${JSON_SERVER_URL}/sessions/${sessionId}`);
}

export function generateSessionId() {
  return crypto.randomUUID();
}

export async function createSession(sessionId, userId) {
  await axios.post(`${JSON_SERVER_URL}/sessions`, {
    id: sessionId,
    userId: userId,
    createdAt: new Date().toISOString(),
  });
}
