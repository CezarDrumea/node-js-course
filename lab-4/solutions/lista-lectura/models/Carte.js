const { DataTypes } = require("sequelize");
const sequelize = require("./index");
const User = require("./User");

const Carte = sequelize.define("Carte", {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  titlu: { type: DataTypes.STRING, allowNull: false },
  autor: { type: DataTypes.STRING, allowNull: false },
  citita: { type: DataTypes.BOOLEAN, defaultValue: false },
  rating: { type: DataTypes.STRING, allowNull: true },
});

Carte.belongsTo(User, { foreignKey: "userId" });
User.hasMany(Carte, { foreignKey: "userId" });

module.exports = Carte;
