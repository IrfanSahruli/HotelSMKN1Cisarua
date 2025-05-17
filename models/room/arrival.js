const { DataTypes, ENUM } = require("sequelize");
const sequelize = require("../../config/database");
const ReservasiGroup = require("./reservasiG");
const RegistrasiGroup = require("./registrasiGLangsung");

const ArrivalGroup = sequelize.define('arrivalGroup', {
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

ReservasiGroup.hasMany(ArrivalGroup, { foreignKey: 'id_reservasi_group', as: 'arrivalReservasi' });
ArrivalGroup.belongsTo(ReservasiGroup, { foreignKey: 'id_reservasi_group' });

RegistrasiGroup.hasMany(ArrivalGroup, { foreignKey: 'id_registrasi', as: 'arrivalRegistrasi' });
ArrivalGroup.belongsTo(RegistrasiGroup, { foreignKey: 'id_registrasi' });

module.exports = ArrivalGroup;