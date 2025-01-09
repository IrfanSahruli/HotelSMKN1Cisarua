const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/database");

const Produk = sequelize.define("produk", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    judul_produk: {
        type: DataTypes.STRING,
        allowNull: false
    },
    foto_produk: {
        type: DataTypes.STRING,
        allowNull: false
    },
    kategori_produk: {
        type: DataTypes.ENUM,
        values: ["Makanan", "Minuman", "Cemilan"],
        allowNull: false
    },
    hargaAwal: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    hargaJual: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    stok: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, { 
    freezeTableName: true,
    timestamps: true
});


module.exports = Produk;
