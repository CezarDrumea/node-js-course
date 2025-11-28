import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import prisma from '../lib/prisma.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PasswordModel {
  constructor() {
    this.dataDir = path.join(__dirname, '../data');
    this.masterKeyFile = path.join(this.dataDir, 'master.key');
    this.defaultAlgorithm = 'aes-256-gcm';
    this.masterKey = this.loadOrGenerateMasterKey();
  }

  loadOrGenerateMasterKey() {
    try {
      fs.mkdirSync(this.dataDir, { recursive: true });
      if (fs.existsSync(this.masterKeyFile)) {
        const keyHex = fs.readFileSync(this.masterKeyFile, 'utf8');
        return Buffer.from(keyHex, 'hex');
      } else {
        const newKey = crypto.randomBytes(32);
        fs.writeFileSync(this.masterKeyFile, newKey.toString('hex'));
        return newKey;
      }
    } catch (error) {
      console.error('Failed to load or generate master key:', error);
      return crypto.randomBytes(32);
    }
  }

  encrypt(text) {
    const algorithm = this.defaultAlgorithm;
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, this.masterKey, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return JSON.stringify({
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    });
  }

  decrypt(encryptedData) {
    const algorithm = this.defaultAlgorithm;
    
    // Parse if it's a string (from database)
    const data = typeof encryptedData === 'string' ? JSON.parse(encryptedData) : encryptedData;

    const decipher = crypto.createDecipheriv(
      algorithm,
      this.masterKey,
      Buffer.from(data.iv, 'hex')
    );

    decipher.setAuthTag(Buffer.from(data.authTag, 'hex'));

    let decrypted = decipher.update(data.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  async getAll(userId = null) {
    try {
      const passwords = await prisma.password.findMany({
        where: userId ? { userId } : {},
        orderBy: { createdAt: 'desc' },
      });
      return passwords;
    } catch (error) {
      console.error('Error getting all passwords:', error.message);
      return [];
    }
  }

  async getById(id) {
    try {
      const password = await prisma.password.findUnique({
        where: { id: parseInt(id) },
      });
      return password || null;
    } catch (error) {
      console.error('Error getting password by id:', error.message);
      return null;
    }
  }

  async create(website, username, password, notes, userId) {
    try {
      const encryptedPassword = this.encrypt(password);

      const newEntry = await prisma.password.create({
        data: {
          website,
          username,
          password: encryptedPassword,
          notes: notes || '',
          userId,
        },
      });
      return newEntry;
    } catch (error) {
      console.error('Error creating password:', error.message);
      throw error;
    }
  }

  async update(id, website, username, password, notes) {
    try {
      const existing = await this.getById(id);

      if (!existing) return null;

      const encryptedPassword = password ? this.encrypt(password) : existing.password;

      const updated = await prisma.password.update({
        where: { id: parseInt(id) },
        data: {
          website,
          username,
          password: encryptedPassword,
          notes: notes !== undefined ? notes : existing.notes,
        },
      });

      return updated;
    } catch (error) {
      console.error('Error updating password:', error.message);
      throw error;
    }
  }

  async delete(id) {
    try {
      const existing = await this.getById(id);

      if (!existing) return false;

      await prisma.password.delete({
        where: { id: parseInt(id) },
      });
      return true;
    } catch (error) {
      console.error('Error deleting password:', error.message);
      throw error;
    }
  }

  getMasterKey() {
    return this.masterKey.toString('hex');
  }
}

export default new PasswordModel();