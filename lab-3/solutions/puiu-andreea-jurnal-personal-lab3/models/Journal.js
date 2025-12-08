const { DataTypes } = require('sequelize');
const sequelize = require('./index');
const User = require('./User');

const Journal = sequelize.define("Journal", {
    title: {
        type: DataTypes.STRING
    },
    content: {
        type: DataTypes.TEXT
    }
});

// relatia: user -> jurnal
User.hasMany(Journal);
Journal.belongsTo(User);

module.exports = Journal;
