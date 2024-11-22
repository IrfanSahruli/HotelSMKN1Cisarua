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
        allowNull: true
    },
    foto_produk: {
        type: DataTypes.STRING,
        allowNull: true
    },
    harga: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    kategori_produk: {
        type: DataTypes.ENUM,
        values: ["Makanan", "Minuman", "Cemilan"],
        allowNull: true
    },
    sub_kategori_produk: {
        type: DataTypes.STRING,
        allowNull: true
    },
    hargaAwal: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    hargaJual: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    stok: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, { 
    freezeTableName: true,
    timestamps: true
});


module.exports = Produk;
