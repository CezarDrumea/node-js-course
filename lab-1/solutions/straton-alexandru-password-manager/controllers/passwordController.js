const PasswordModel = require('../models/PasswordModel');

class PasswordController {
  async index(req, res) {
    try {
      const passwords = await PasswordModel.getAll();

      res.render('index', { 
        passwords,
        masterKey: await PasswordModel.getMasterKey()
      });

    } catch (error) {
      console.error('Index error:', error);
      const msg = error && (error.message || error.code || error.toString());
      res.status(500).send(`Internal error: ${msg}`);
    }
  }

  async create(req, res) {

    try {
      const { website, username, password, notes } = req.body;
      
      if (!website || !username || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      await PasswordModel.create(website, username, password, notes);

      res.redirect('/');

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async reveal(req, res) {
    try {
      const { id } = req.params;
      const entry = await PasswordModel.getById(id);

      
      if (!entry) {
        return res.status(404).json({ error: 'Password not found' });
      }
      
      const decryptedPassword = await PasswordModel.decrypt(entry.password);
      res.json({ password: decryptedPassword });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async update(req, res) {

    try {
      const { id } = req.params;
      const { website, username, password, notes } = req.body;
      
      const updated = await PasswordModel.update(id, website, username, password, notes);

      
      if (!updated) {
        return res.status(404).json({ error: 'Password not found' });
      }
      
      res.json({ success: true });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const deleted = await PasswordModel.delete(id);

      
      if (!deleted) {
        return res.status(404).json({ error: 'Password not found' });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new PasswordController();