const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");
const ReservasiGroup = require("./reservasiG");

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
            key : 'id'
        }
    },
    room: {
        type: DataTypes.STRING,
        allowNull : false
    },
    rate: {
        type: DataTypes.INTEGER,
        allowNull : false
    },
    stay: {
        type: DataTypes.INTEGER,
        allowNull : false
    },
    sub_total: {
        type: DataTypes.INTEGER,
        allowNull : false
    },
    arrival: {
        type: DataTypes.DATE,
        allowNull : false
    },
    departure: {
        type: DataTypes.DATE,
        allowNull : false
    }
}, {
    freezeTableName : true,
    timestamps : true
})

ReservasiGroup.hasMany(RoomG, {foreignKey: 'id_reservasi'});
RoomG.belongsTo(ReservasiGroup, { foreignKey: 'id_reservasi' });

module.exports = RoomG;