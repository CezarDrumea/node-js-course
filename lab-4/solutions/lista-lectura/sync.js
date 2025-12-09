// sync.js
const sequelize = require("./models/index");
const User = require("./models/User");
const Carte = require("./models/Carte");

sequelize
  .sync({ alter: true }) // creeaza sau modifica tabele
  .then(() => {
    console.log("Tabelele Users și Carti au fost create!");
    process.exit();
  })
  .catch((err) => console.error("Eroare la creare tabele:", err));
