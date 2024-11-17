const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");
const CheckinOut = require("./inOut");

const Other = sequelize.define('other', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true 
    },
    id_inOut: {
        type: DataTypes.INTEGER,
        references: {
            model: CheckinOut,
            key : 'id'
        }
    },
    detail: {
        type: DataTypes.STRING,
    },
    price: {
        type: DataTypes.INTEGER
    },
}, {
    freezeTableName : true,
    timestamps : true
})

CheckinOut.hasMany(Other, {foreignKey: 'id_inOut'});
Other.belongsTo(CheckinOut, { foreignKey: 'id_inOut' });

module.exports = Other;