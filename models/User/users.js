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
        allowNull : false
    },
    password: {
        type: DataTypes.STRING,
         allowNull : false
    },
    email: {
        type: DataTypes.STRING,
         allowNull : false
    },
    no_hp: {
        type: DataTypes.STRING,
         allowNull : false
    },
    role: {
        type: DataTypes.ENUM,
        values: ["user", "kasir", "admin", "super admin", "resepsionis"],
         allowNull : false
    },
}, {
    freezeTableName: true,
    timestamps : true
});

module.exports = User;
