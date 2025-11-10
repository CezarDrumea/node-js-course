import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'db.json');

export const getAllItems = () => {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ items: [] }, null, 2));
    return [];
  }
  const data = fs.readFileSync(dbPath, 'utf-8');
  try {
    const db = JSON.parse(data);
    return db.items || [];
  } catch (error) {
    return [];
  }
};

export const saveAllItems = (items) => {
  fs.writeFileSync(dbPath, JSON.stringify({ items: items }, null, 2));
};

export function addItem(title, description) {
  const items = getAllItems();
  const newId = String(Date.now());
  const newItem = {
    id: newId,
    title,
    description,
    watched: false,
  };
  items.push(newItem);
  saveAllItems(items);
  return newItem;
}

export const deleteItem = (id) => {
  let items = getAllItems();
  const initialLength = items.length;
  items = items.filter(item => item.id !== String(id));
  if (items.length < initialLength) {
    saveAllItems(items);
    return true;
  }
  return false;
};

export const toggleWatched = (id) => {
  let items = getAllItems();
  const itemIndex = items.findIndex(item => item.id === String(id));

  if (itemIndex > -1) {
    items[itemIndex].watched = !items[itemIndex].watched;
    saveAllItems(items);
    return items[itemIndex].watched;
  }
  return null;
};


export const updateItem = (id, title, description) => {
  let items = getAllItems();
  const itemIndex = items.findIndex(item => item.id === String(id));

  if (itemIndex > -1) {
    if (title) items[itemIndex].title = title;
    if (description) items[itemIndex].description = description;
    saveAllItems(items);
    return items[itemIndex];
  }
  return null;
};

export const getItemById = (id) => {
  const items = getAllItems();
  return items.find(item => item.id === String(id));
};