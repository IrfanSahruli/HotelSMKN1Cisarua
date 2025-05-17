const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");
const ReservasiGroup = require("./reservasiG");
const Reservasi = require("./reservasi");

const RoomG = sequelize.define('roomg', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    id_reservasi: {
        type: DataTypes.INTEGER,
        references: {
            model: ReservasiGroup,
            key: 'id'
        }
    },
    id_reservasiP: {
        type: DataTypes.INTEGER,
        references: {
            model: Reservasi,
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
        type: DataTypes.ENUM('in', 'out', 'reservasi'),
        allowNull: false,
        defaultValue: 'reservasi'
    },
}, {
    freezeTableName: true,
    timestamps: true
})

ReservasiGroup.hasMany(RoomG, { foreignKey: 'id_reservasi' });
RoomG.belongsTo(ReservasiGroup, { foreignKey: 'id_reservasi' });

Reservasi.hasMany(RoomG, { foreignKey: 'id_reservasiP' });
RoomG.belongsTo(Reservasi, { foreignKey: 'id_reservasiP' });

module.exports = RoomG;