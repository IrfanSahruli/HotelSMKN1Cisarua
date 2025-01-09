const { DataTypes, ENUM } = require("sequelize");
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
    name : {
        type: DataTypes.STRING,
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
    checkin: {
        type: DataTypes.DATE,
        allowNull : false
    },
    checkout: {
        type: DataTypes.DATE,
        allowNull : false
    },
    stay: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
     bookedBy: {
        type: DataTypes.STRING,
        allowNull : false
    },
    room: {
        type: DataTypes.STRING,
        allowNull : false
    },
    preferency: {
        type: DataTypes.ENUM('Smoking', 'No Smoking'),
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
    rate: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    total: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('reservasi', 'in', 'out'),
        allowNull: false,
        defaultValue : 'reservasi'
    },
    total: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    down: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    remaining: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    payment: {
        type: DataTypes.ENUM('cash', 'debit', 'transfer'),
        allowNull : true
    }
}, {
    freezeTableName : true,
    timestamps : true
})

User.hasMany(Reservasi, {foreignKey: 'userId'});
Reservasi.belongsTo(User, { foreignKey: 'userId' });

module.exports = Reservasi;