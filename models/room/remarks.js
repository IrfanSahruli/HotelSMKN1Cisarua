const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");
const Reservasi = require("./reservasi");
const Registrasi = require("./inOut");
const ReservasiGroup = require("./reservasiG");

const Remarks = sequelize.define('remarks', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true 
    },
    id_registrasi: {
        type: DataTypes.INTEGER,
        allowNull : true,
        references: {
            model: Registrasi,
            key : 'id'
        }
    },
    id_reservasi: {
        type: DataTypes.INTEGER,
        allowNull : true,
        references: {
            model: ReservasiGroup,
            key : 'id'
        }
    },
    detail: {
        type: DataTypes.STRING,
    },
}, {
    freezeTableName : true,
    timestamps : true
})

Registrasi.hasMany(Remarks, {foreignKey: 'id_registrasi'});
Remarks.belongsTo(Registrasi, { foreignKey: 'id_registrasi' });

ReservasiGroup.hasMany(Remarks, {foreignKey: 'id_reservasi'});
Remarks.belongsTo(ReservasiGroup, { foreignKey: 'id_reservasi' });

module.exports = Remarks;