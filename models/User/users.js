const { DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");
const db = require("../../config/database");

const User = db.define("user", {
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
    alamat: {
        type: DataTypes.STRING
    }
}, {
    freezeTableName: true
});

module.exports = User;
