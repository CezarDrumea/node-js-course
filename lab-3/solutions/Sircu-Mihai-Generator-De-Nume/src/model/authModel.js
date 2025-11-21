import crypto from 'crypto';
import User from './User.js';
import Session from './Session.js';

const isNonEmpty = (s) => typeof s === 'string' && s.trim().length > 0;

export async function findUserExact(username, password) {
  if (!isNonEmpty(username) || !isNonEmpty(password)) return null;
  const user = await User.findOne({ where: { username, password } });
  return user || null;
}

export async function getUserById(userId) {
  const user = await User.findByPk(userId);
  return user || null;
}

export async function getSessionById(sessionId) {
  const session = await Session.findByPk(sessionId);
  return session || null;
}

export async function deleteSession(sessionId) {
  await Session.destroy({ where: { id: sessionId } });
}

export function generateSessionId() {
  return crypto.randomUUID();
}

export async function createSession(sessionId, userId) {
  await Session.create({
    id: sessionId,
    userId: userId,
    createdAt: new Date(),
  });
}
