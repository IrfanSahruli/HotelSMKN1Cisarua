const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/database");
const User = require("../../User/users");

const Order = sequelize.define("order", {
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
    kasirName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    atasNama: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    total: {
        type: DataTypes.INTEGER,
        allowNull : false 
    },
    biayaLayanan: {
        type: DataTypes.INTEGER,
        allowNull : false
    },
    subTotal :{
        type: DataTypes.INTEGER,
        allowNull : false
    },
    ppn: {
        type: DataTypes.INTEGER,
        allowNull : false
    }
}, {
    freezeTableName: true,
    timestamps: true
})

User.hasMany(Order, {foreignKey: 'userId'});
Order.belongsTo(User, { foreignKey: 'userId' });

module.exports = Order;