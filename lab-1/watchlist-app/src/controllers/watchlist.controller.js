import { getAllItems, addItem, deleteItem, toggleWatched, updateItem, getItemById } from '../models/watchlist.model.js';

export const showWatchlist = (req, res) => {
  const items = getAllItems();
  res.render('index', { items, error: req.query.error });
};

export const createItem = (req, res) => {
  const { title, description } = req.body;
  if (!title || !description) {
    return res.redirect('/watchlist?error=' + encodeURIComponent('All fields are required!'));
  }
  addItem(title, description);
  res.redirect('/watchlist');
};

export const removeItem = (req, res) => {
  deleteItem(req.params.id);
  res.redirect('/watchlist');
};

export const toggleWatchedStatus = (req, res) => {
  toggleWatched(req.params.id);
  res.redirect('/watchlist');
};


export const showEditForm = (req, res) => {
  const item = getItemById(req.params.id);
  if (!item) {
    return res.redirect('/watchlist?error=' + encodeURIComponent('Item not found for editing.'));
  }
  res.render('edit', { item, error: req.query.error });
};

export const saveEdit = (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;

  if (!title || !description) {
    return res.redirect(`/watchlist/edit/${id}?error=` + encodeURIComponent('Title and Description are required!'));
  }
  updateItem(id, title, description);
  res.redirect('/watchlist');
};