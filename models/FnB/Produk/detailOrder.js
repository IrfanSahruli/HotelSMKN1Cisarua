const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/database");
const Order = require("./order");
const Produk = require("./produk");

const Detail_Order = sequelize.define("order_detail", {
     id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    order_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Order,
            key : 'id'
        }
    },
    id_produk: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Produk,
            key : 'id'
        }
    },
    jumlah: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    subTotal :{
        type: DataTypes.INTEGER,
        allowNull : false
    },
    nama: {
        type: DataTypes.STRING,
        allowNull : false
    },
    tambahan: {
        type: DataTypes.STRING,
        allowNull : true
    }
}, {
    freezeTableName: true,
    timestamps: true
})

Order.hasMany(Detail_Order, {foreignKey: 'order_id'});
Detail_Order.belongsTo(Order, { foreignKey: 'order_id' });

Produk.hasMany(Detail_Order, {foreignKey: 'id_produk'});
Detail_Order.belongsTo(Produk, { foreignKey: 'id_produk' });

module.exports = Detail_Order;