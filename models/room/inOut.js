const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");
const Reservasi = require("./reservasi");
const ReservasiGroup = require("./reservasiG");

const Registrasi = sequelize.define('registrasi', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true 
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
        allowNull : true,
        references: {
            model: Reservasi,
            key : 'id'
        }
    },
    id_reservasi_group: {
        allowNull : true,
        type: DataTypes.INTEGER,
        references: {
            model: ReservasiGroup,
            key : 'id'
        }
    },
    fullname: {
        type: DataTypes.STRING,
        allowNull : false
    },
    title: {
        type: DataTypes.STRING,
        allowNull : false
    },
    address: {
        type: DataTypes.STRING,
        allowNull : false
    },
    postal: {
        type: DataTypes.STRING,
        allowNull : false
    },
    id_number: {
        type: DataTypes.STRING,
        allowNull : false
    },
    itype: {
        type: DataTypes.ENUM('KTP/SIM', 'Passport'),
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull : false
    },
    phone: {
        type: DataTypes.STRING,
        allowNull : false
    },
    subtotal: {
        type: DataTypes.INTEGER,
        allowNull : false
    },
    deposit: {
        type: DataTypes.INTEGER,
        allowNull : false
    },
    total: {
        type: DataTypes.INTEGER,
        allowNull : false
    },
    paymentmethod: {
        type: DataTypes.STRING,
        allowNull : false
    },
    cardNo: {
        type: DataTypes.INTEGER,
        // allowNull : false
    },
    cvv: {
        type: DataTypes.STRING,
        // allowNull: false,
    },
    exp: {
        type: DataTypes.DATE,
    },
    front_desk: {
        type: DataTypes.STRING,
        allowNull : false
    },
    formStatus: {
        type: DataTypes.ENUM('checkin', 'checkout'),
        defaultValue : 'checkin'
    },
    formStatusGP: {
        type: DataTypes.ENUM('Group', 'Personal'),
        allowNull : false
    }
}, {
    freezeTableName : true,
    timestamps : true
})

Reservasi.hasMany(Registrasi, {foreignKey: 'id_reservasi'});
Registrasi.belongsTo(Reservasi, { foreignKey: 'id_reservasi' });

ReservasiGroup.hasMany(Registrasi, {foreignKey: 'id_reservasi_group'});
Registrasi.belongsTo(ReservasiGroup, { foreignKey: 'id_reservasi_group' });

module.exports = Registrasi;