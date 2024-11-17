const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

const Room = sequelize.define('room', {
     id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true 
    },
    roomNo: {
        type: DataTypes.INTEGER,
        allowNull : false
    },
    roomType: {
        type: DataTypes.STRING,
        allowNull : false
    },
    harga: {
        type: DataTypes.INTEGER,
        allowNull : false
    },
    statusRoom: {
        type: DataTypes.ENUM('booked', 'available'),
        defaultValue : 'available'
    }
}, {
    freezeTableName : true,
    timestamps : true
})

module.exports = Room;