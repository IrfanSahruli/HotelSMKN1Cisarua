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
        type: DataTypes.STRING,
        allowNull: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true
    },
    no_hp: {
        type: DataTypes.STRING,
        allowNull: true
    },
    role: {
        type: DataTypes.ENUM,
        values: ["user", "kasir", "admin", "super admin", "resepsionis"],
        allowNull: true
    },
}, {
    freezeTableName: true,
    timestamps: true
});

module.exports = User;
