const { DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");
const sequelize = require("../../config/database");

const User = sequelize.define("user", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    username: {
        type: DataTypes.STRING
    },
    password: {
        type: DataTypes.STRING
    },
    email: {
        type: DataTypes.STRING
    },
    no_hp: {
        type: DataTypes.STRING
    },
    role: {
        type: DataTypes.ENUM,
        values: ["user", "kasir", "admin", "super admin", "resepsionis"]
    },
}, {
    freezeTableName: true
});

module.exports = User;
