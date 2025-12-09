const fs = require("fs");
const path = require("path");

const cartiPath = path.join(__dirname, "..", "data", "carti.json");

function getCarti() {
  if (!fs.existsSync(cartiPath)) return [];
  const data = fs.readFileSync(cartiPath, "utf8");
  return JSON.parse(data || "[]");
}

function saveCarti(carti) {
  fs.writeFileSync(cartiPath, JSON.stringify(carti, null, 2));
}

module.exports = { getCarti, saveCarti };
