import axios from "axios";
import crypto from "crypto";

const JSON_SERVER_URL = process.env.JSON_SERVER_URL || "http://localhost:3001";

// Hash parola (SHA-256)
export const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

// Caută user după username
export const findUserByUsername = async (username) => {
  const response = await axios.get(`${JSON_SERVER_URL}/users`, {
    params: { username }
  });
  return response.data;
};

// Caută user după username + password (criptată)
export const findUser = async (username, password) => {
  const hashedPassword = hashPassword(password);
  const response = await axios.get(`${JSON_SERVER_URL}/users`, {
    params: { username, password: hashedPassword }
  });
  return response.data;
};

// Creează user nou (stocăm parola criptată)
export const createUser = async (username, password) => {
  const hashedPassword = hashPassword(password);
  const response = await axios.post(`${JSON_SERVER_URL}/users`, {
    username,
    password: hashedPassword
  });
  return response.data;
};

// Creează o sesiune în DB
export const createSession = async (sessionId, user) => {
  const response = await axios.post(`${JSON_SERVER_URL}/sessions`, {
    id: sessionId,
    user: {
      id: user.id,
      username: user.username
    },
    createdAt: Date.now()
  });
  return response.data;
};

// Șterge o sesiune din DB
export const deleteSession = async (sessionId) => {
  const response = await axios.delete(`${JSON_SERVER_URL}/sessions/${sessionId}`);
  return response.data;
};

// Verifică dacă există o sesiune validă
export const getSessionById = async (sessionId) => {
  const response = await axios.get(`${JSON_SERVER_URL}/sessions`, {
    params: { id: sessionId }
  });
  return response.data;
};
