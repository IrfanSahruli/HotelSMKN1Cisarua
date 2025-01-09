const { DataTypes, ENUM } = require("sequelize");
const sequelize = require("../../config/database");
const ReservasiGroup = require("./reservasiG");

const DepartureGroup = sequelize.define('DepartureGroup', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true 
    },
    datee: {
        type: DataTypes.DATE,
        allowNull : false
    },
    flight: {
        type: DataTypes.STRING,
        allowNull : false
    },
    time: {
        type: DataTypes.TIME,
        // allowNull : false
    },
    id_reservasi_group: {
        type: DataTypes.INTEGER,
        references: {
            model: ReservasiGroup,
            key : 'id'
        }
    },
}, {
    freezeTableName : true,
    timestamps : true
})
 
ReservasiGroup.hasMany(DepartureGroup, {foreignKey: 'id_reservasi_group'});
DepartureGroup.belongsTo(ReservasiGroup, { foreignKey: 'id_reservasi_group' });

module.exports = DepartureGroup;