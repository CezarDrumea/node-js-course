const fs = require("fs");
const path = require("path");

const usersPath = path.join(__dirname, "..", "data", "utilizatori.json");

function getUsers() {
  if (!fs.existsSync(usersPath)) return [];
  const data = fs.readFileSync(usersPath, "utf8");
  return JSON.parse(data || "[]");
}

function saveUsers(users) {
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
}

module.exports = { getUsers, saveUsers };
