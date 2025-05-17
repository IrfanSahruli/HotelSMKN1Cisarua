const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");
// const ReservasiGroup = require("./reservasiG");
// const Reservasi = require("./reservasi");
const RegistrasiLangsung = require("./registrasiLangsung");
const RegistrasiGroup = require("./registrasiGLangsung");

const RoomR = sequelize.define('roomR', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    id_registrasi: {
        type: DataTypes.INTEGER,
        references: {
            model: RegistrasiGroup,
            key: 'id'
        }
    },
    id_registrasiP: {
        type: DataTypes.INTEGER,
        references: {
            model: RegistrasiLangsung,
            key: 'id'
        }
    },
    room: {
        type: DataTypes.STRING,
        allowNull: false
    },
    rate: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    stay: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    sub_total: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    arrival: {
        type: DataTypes.DATE,
        allowNull: false
    },
    departure: {
        type: DataTypes.DATE,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('in', 'out'),
        allowNull: false,
        defaultValue: 'in'
    },
}, {
    freezeTableName: true,
    timestamps: true
})

RegistrasiGroup.hasMany(RoomR, { foreignKey: 'id_registrasi' });
RoomR.belongsTo(RegistrasiGroup, { foreignKey: 'id_registrasi' });

RegistrasiLangsung.hasMany(RoomR, { foreignKey: 'id_registrasiP' });
RoomR.belongsTo(RegistrasiLangsung, { foreignKey: 'id_registrasiP' });

module.exports = RoomR;