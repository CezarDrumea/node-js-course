const crypto = require('crypto');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

class PasswordModel {
  constructor() {
    this.dataDir = path.join(__dirname, '../data');
    this.masterKeyFile = path.join(this.dataDir, 'master.key');
    this.defaultAlgorithm = 'aes-256-gcm';
    this.masterKey = this.loadOrGenerateMasterKey();
    this.apiBaseUrl = 'http://localhost:3001';
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
      // Fallback for safety, though not persistent
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

    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }

  decrypt(encryptedData) {
    const algorithm = this.defaultAlgorithm;

    const decipher = crypto.createDecipheriv(
      algorithm,
      this.masterKey,
      Buffer.from(encryptedData.iv, 'hex')
    );

    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));

    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  async getAll(userId = null) {
    const res = await axios.get(`${this.apiBaseUrl}/passwords`);
    let passwords = res.data || [];
    
    // Filter by userId if provided
    if (userId) {
      passwords = passwords.filter(p => p.userId === userId || p.userId === null);
    }
    
    return passwords;
  }

  async getById(id) {
    try {
      const res = await axios.get(`${this.apiBaseUrl}/passwords/${id}`);
      return res.data || null;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async create(website, username, password, notes, userId) {
    const encryptedPassword = this.encrypt(password);

    const newEntry = {
      id: Date.now().toString(),
      website,
      username,
      password: encryptedPassword,
      notes: notes || '',
      userId: userId || null,
      createdAt: new Date().toISOString()
    };

    const res = await axios.post(`${this.apiBaseUrl}/passwords`, newEntry);
    return res.data;
  }

  async update(id, website, username, password, notes) {
    const existing = await this.getById(id);

    if (!existing) return null;

    const encryptedPassword = password ? this.encrypt(password) : existing.password;

    const updated = {
      ...existing,
      website,
      username,
      password: encryptedPassword,
      notes: notes !== undefined ? notes : existing.notes,
      updatedAt: new Date().toISOString()
    };

    const res = await axios.put(`${this.apiBaseUrl}/passwords/${id}`, updated);
    return res.data;
  }

  async delete(id) {
    const existing = await this.getById(id);

    if (!existing) return false;

    await axios.delete(`${this.apiBaseUrl}/passwords/${id}`);
    return true;
  }

  getMasterKey() {
    return this.masterKey.toString('hex');
  }
}

module.exports = new PasswordModel();