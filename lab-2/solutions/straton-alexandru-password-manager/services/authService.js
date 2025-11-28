const jwt = require('jsonwebtoken');
const axios = require('axios');
const crypto = require('crypto');

const SECRET = process.env.JWT_SECRET || 'supersecret';
const JSON_SERVER_URL = process.env.JSON_SERVER_URL || 'http://localhost:3001';

const isNonEmpty = (s) => typeof s === 'string' && s.trim().length > 0;

/**
 * Find user by exact username and password match
 */
async function findUserExact(username, password) {
  if (!isNonEmpty(username) || !isNonEmpty(password)) return null;

  try {
    const { data } = await axios.get(`${JSON_SERVER_URL}/users`, {
      params: { username, password },
    });
    return Array.isArray(data)
      ? data.find((u) => u.username === username && u.password === password) || null
      : null;
  } catch (error) {
    console.error('Error finding user:', error.message);
    return null;
  }
}

/**
 * Create a new session for cookie-based auth
 */
async function createSession(userId) {
  const sessionId = crypto.randomUUID();
  try {
    await axios.post(`${JSON_SERVER_URL}/sessions`, {
      id: sessionId,
      userId,
      createdAt: new Date().toISOString(),
    });
    return sessionId;
  } catch (error) {
    console.error('Error creating session:', error.message);
    throw error;
  }
}

/**
 * Generate JWT token
 */
function generateToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, name: user.name },
    SECRET,
    { expiresIn: '24h' }
  );
}

module.exports = {
  findUserExact,
  createSession,
  generateToken,
};
