const { DataTypes, ENUM } = require("sequelize");
const sequelize = require("../../config/database");
const ReservasiGroup = require("./reservasiG");
const RegistrasiGroup = require("./registrasiGLangsung");

const DepartureGroup = sequelize.define('DepartureGroup', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    datee: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    flight: {
        type: DataTypes.STRING,
        allowNull: false
    },
    time: {
        type: DataTypes.TIME,
        // allowNull : false
    },
    id_reservasi_group: {
        type: DataTypes.INTEGER,
        references: {
            model: ReservasiGroup,
            key: 'id'
        }
    },
    id_registrasi: {
        type: DataTypes.INTEGER,
        references: {
            model: RegistrasiGroup,
            key: 'id'
        }
    },
}, {
    freezeTableName: true,
    timestamps: true
})

ReservasiGroup.hasMany(DepartureGroup, { foreignKey: 'id_reservasi_group', as: 'departureReservasi' });
DepartureGroup.belongsTo(ReservasiGroup, { foreignKey: 'id_reservasi_group' });

RegistrasiGroup.hasMany(DepartureGroup, { foreignKey: 'id_registrasi', as: 'departureRegistrasi' });
DepartureGroup.belongsTo(RegistrasiGroup, { foreignKey: 'id_registrasi' });

module.exports = DepartureGroup;