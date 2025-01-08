const { DataTypes, ENUM } = require("sequelize");
const sequelize = require("../../config/database");
const User = require("../User/users");

const ReservasiGroup = sequelize.define('reservasiGroup', {
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
    name_of_travel: {
        type: DataTypes.STRING,
        // allowNull : false
    },
    orCompany: {
        type: DataTypes.INTEGER,
        // allowNull: false,
    },
     address: {
        type: DataTypes.STRING,
        allowNull : false
    },
    contact: {
        type: DataTypes.STRING,
        allowNull : false
    },
    deposit: {
        type: DataTypes.STRING,
         allowNull : false
    },
    clrek: {
        type: DataTypes.STRING,
        allowNull : false
    },
    dateC: {
        type: DataTypes.DATE,
        allowNull : false
    },
    followup: {
        type: DataTypes.ENUM('3 Months', '2 Months', '1 Months'),
        // allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('reservasi', 'in', 'out'),
        allowNull: false,
        defaultValue : 'reservasi'
    },
    romming: {
        type: DataTypes.STRING,
        // allowNull: true,
    },
    phone: {
        type: DataTypes.STRING,
        // allowNull: false,
    },
    letter: {
        type: DataTypes.STRING,
        // allowNull: false,
    },
    celex: {
        type: DataTypes.STRING,
        allowNull : true
    },
    facsimile: {
        type: DataTypes.STRING,
        allowNull : true
    },
    back_lip: {
        type: DataTypes.DATE,
        allowNull : true
    },
    charter: {
        type: DataTypes.DATE,
        allowNull : true
    },
    entered_by: {
        type: DataTypes.STRING,
        allowNull : false
    },
    total: {
        type: DataTypes.INTEGER,
        allowNull : false
    },
     payment: {
        type: DataTypes.ENUM('cash', 'debit', 'transfer'),
        allowNull : false
    },
    adult: {
         type: DataTypes.INTEGER,
        allowNull : false
    },
    children: {
        type: DataTypes.INTEGER,
        allowNull : false
    },
    total: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    down: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    remaining: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
}, {
    freezeTableName : true,
    timestamps : true
})

User.hasMany(ReservasiGroup, {foreignKey: 'userId'});
ReservasiGroup.belongsTo(User, { foreignKey: 'userId' });

module.exports = ReservasiGroup;