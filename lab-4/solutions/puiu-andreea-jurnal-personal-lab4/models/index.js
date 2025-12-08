const { Sequelize, DataTypes } = require("sequelize");
const path = require("path");

// Baza de date SQLite in data/database.sqlite
const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: path.join(__dirname, "..", "data", "database.sqlite"),
    logging: false,
});

// Model User
const User = sequelize.define("User", {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

// Model JournalEntry
const JournalEntry = sequelize.define("JournalEntry", {
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    date: {
        type: DataTypes.STRING, // pentru afisare frumoasa cu toLocaleString
        allowNull: false,
    },
});

// Relatii
User.hasMany(JournalEntry, { foreignKey: "userId" });
JournalEntry.belongsTo(User, { foreignKey: "userId" });

module.exports = {
    sequelize,
    User,
    JournalEntry,
};
