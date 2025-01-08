const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");
// const CheckinOut = require("./inOut");
const ReservasiGroup = require("./reservasiG");

const Makanan = sequelize.define('makanan', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true 
    },
    id_reservasi_group: {
        type: DataTypes.INTEGER,
        references: {
            model: ReservasiGroup,
            key : 'id'
        }
    },
    meal: {
        type: DataTypes.STRING,
    },
    tours: {
        type: DataTypes.STRING
    },
    account: {
        type: DataTypes.STRING
    }
}, {
    freezeTableName : true,
    timestamps : true
})

ReservasiGroup.hasMany(Makanan, {foreignKey: 'id_reservasi_group'});
Makanan.belongsTo(ReservasiGroup, { foreignKey: 'id_reservasi_group' });

module.exports = Makanan;