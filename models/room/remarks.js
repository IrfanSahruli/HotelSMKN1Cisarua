const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");
const Reservasi = require("./reservasi");

const Remarks = sequelize.define('remarks', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true 
    },
    id_reservasi: {
        type: DataTypes.INTEGER,
        references: {
            model: Reservasi,
            key : 'id'
        }
    },
    detail: {
        type: DataTypes.STRING,
    },
    price: {
        type: DataTypes.INTEGER
    }
}, {
    freezeTableName : true,
    timestamps : true
})

Reservasi.hasMany(Remarks, {foreignKey: 'id_reservasi'});
Remarks.belongsTo(Reservasi, { foreignKey: 'id_reservasi' });

module.exports = Remarks;