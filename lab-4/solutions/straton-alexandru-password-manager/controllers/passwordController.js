import PasswordModel from '../models/PasswordModel.js';

class PasswordController {
  async shell(req, res) {
    try {
      res.render('index', {
        passwords: [],
        masterKey: '',
        user: { name: '' },
        authType: null,
      });
    } catch (error) {
      console.error('Shell error:', error);
      const msg = error && (error.message || error.code || error.toString());
      res.status(500).send(`Internal error: ${msg}`);
    }
  }

  async dashboardData(req, res) {
    try {
      const passwords = await PasswordModel.getAll(req.user.id);
      const masterKey = await PasswordModel.getMasterKey();

      res.json({
        passwords,
        masterKey,
        user: req.user,
        authType: req.authType,
      });
    } catch (error) {
      console.error('Dashboard data error:', error);
      const msg = error && (error.message || error.code || error.toString());
      res.status(500).json({ message: msg });
    }
  }

  async index(req, res) {
    try {
      const passwords = await PasswordModel.getAll(req.user.id);

      res.render('index', { 
        passwords,
        masterKey: await PasswordModel.getMasterKey(),
        user: req.user,
        authType: req.authType
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
      
      await PasswordModel.create(website, username, password, notes, req.user.id);

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
      
      const decryptedPassword = PasswordModel.decrypt(entry.password);
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

export default new PasswordController();