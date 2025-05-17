const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");
// const ReservasiGroup = require("./reservasiG");
// const Reservasi = require("./reservasi");
// const RegistrasiLangsung = require("./registrasiLangsung");

const RoomData = sequelize.define('roomData', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    roomNo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    gabungan: {
        type: DataTypes.STRING,
        allowNull: false
    },
    roomType: {
        type: DataTypes.STRING,
        allowNull: false
    },
    statusRoom: {
        type: DataTypes.ENUM('VR', 'VD', 'OC', 'OD'),
        allowNull: false,
        defaultValue: 'OC'
    }
}, {
    freezeTableName: true,
    timestamps: true
})

module.exports = RoomData;