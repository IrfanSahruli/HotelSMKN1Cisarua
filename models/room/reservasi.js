const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");
const User = require("../User/users");

const Reservasi = sequelize.define('reservasi', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true 
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key : 'id'
        }
    },
    bookedBy: {
        type: DataTypes.STRING,
        allowNull : false
    },
    name : {
        type: DataTypes.STRING,
        allowNull : false
    },
    checkin: {
        type: DataTypes.DATE,
        allowNull : false
    },
    checkout: {
        type: DataTypes.DATE,
        allowNull : false
    },
    roomType: {
        type: DataTypes.STRING,
        allowNull : false
    },
    roomNo: {
        type: DataTypes.INTEGER,
        allowNull : false
    },
    email: {
        type: DataTypes.STRING,
        allowNull : false
    },
    phone: {
        type: DataTypes.STRING,
        allowNull : false
    },
    adult: {
        type: DataTypes.STRING,
        allowNull : false
    },
    children: {
        type: DataTypes.STRING,
        allowNull : false
    },
    status: {
        type: DataTypes.ENUM('reservasi', 'in', 'out'),
        allowNull: false,
        defaultValue : 'reservasi'
    },
    subTotalRemarks: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    subTotalRoom: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    total: {
        type: DataTypes.INTEGER,
        allowNull: true,
    }
}, {
    freezeTableName : true,
    timestamps : true
})

User.hasMany(Reservasi, {foreignKey: 'userId'});
Reservasi.belongsTo(User, { foreignKey: 'userId' });

module.exports = Reservasi;