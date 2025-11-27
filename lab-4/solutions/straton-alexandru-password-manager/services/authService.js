import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';

const SECRET = process.env.JWT_SECRET || 'supersecret';

const isNonEmpty = (s) => typeof s === 'string' && s.trim().length > 0;

/**
 * Find user by exact username and password match
 */
export async function findUserExact(username, password) {
  if (!isNonEmpty(username) || !isNonEmpty(password)) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });
    
    if (user && user.password === password) {
      return user;
    }
    return null;
  } catch (error) {
    console.error('Error finding user:', error.message);
    return null;
  }
}

/**
 * Create a new session for cookie-based auth
 */
export async function createSession(userId) {
  try {
    const session = await prisma.session.create({
      data: {
        userId,
      },
    });
    return session.id;
  } catch (error) {
    console.error('Error creating session:', error.message);
    throw error;
  }
}

/**
 * Get session by ID
 */
export async function getSessionById(sessionId) {
  try {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { user: true },
    });
    return session;
  } catch (error) {
    console.error('Error getting session:', error.message);
    return null;
  }
}

/**
 * Delete session
 */
export async function deleteSession(sessionId) {
  try {
    await prisma.session.delete({
      where: { id: sessionId },
    });
    return true;
  } catch (error) {
    console.error('Error deleting session:', error.message);
    return false;
  }
}

/**
 * Generate JWT token
 */
export function generateToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, name: user.name },
    SECRET,
    { expiresIn: '24h' }
  );
}
