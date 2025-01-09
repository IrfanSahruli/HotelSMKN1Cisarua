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
    statusRoom: {
        type: DataTypes.ENUM('VR', 'VD', 'OD', 'OC'),
        defaultValue : 'VR'
    },
    gabungan: {
        type: DataTypes.STRING,
        allowNull : false
    }
}, {
    freezeTableName : true,
    timestamps : true
})

module.exports = Room;