const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");
const Reservasi = require("./reservasi");

const CheckinOut = sequelize.define('checkinOut', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true 
    },
    roomNO: {
        type: DataTypes.INTEGER,
        allowNull : false
    },
    userIn: {
        type: DataTypes.STRING,
        allowNull : false
    },
    userOut: {
        type: DataTypes.STRING,
    },
    id_reservasi: {
        type: DataTypes.INTEGER,
        references: {
            model: Reservasi,
            key : 'id'
        }
    },
    checkin: {
        type: DataTypes.DATE,
        allowNull : false
    },
    checkout: {
        type: DataTypes.DATE,
        allowNull : false
    },
    wakeUp: {
        type: DataTypes.DATE,
        allowNull : false
    },
    national: {
        type: DataTypes.STRING,
        allowNull : false
    },
    purpose: {
        type: DataTypes.STRING,
        allowNull : false
    },
    description: {
        type: DataTypes.STRING,
        allowNull : false
    },
    total: {
        type: DataTypes.STRING,
        allowNull : false
    },
    totalCharge: {
        type: DataTypes.STRING,
    },
    totalRemarks: {
        type: DataTypes.STRING,
    },
    totalRoom: {
        type: DataTypes.STRING,
    },
    paymentIn: {
        type: DataTypes.ENUM('debit', 'cash'),
        allowNull: false,
    },
    paymentOut: {
        type: DataTypes.ENUM('debit', 'cash'),
    },
    formStatus: {
        type: DataTypes.ENUM('checkin', 'checkout'),
        defaultValue : 'checkin'
    }
}, {
    freezeTableName : true,
    timestamps : true
})

Reservasi.hasMany(CheckinOut, {foreignKey: 'id_reservasi'});
CheckinOut.belongsTo(Reservasi, { foreignKey: 'id_reservasi' });

module.exports = CheckinOut;