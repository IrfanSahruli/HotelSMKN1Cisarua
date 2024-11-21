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
        values: ["makanan", "minuman"],
        allowNull: true
    },
    sub_kategori_produk: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, { 
    freezeTableName: true,
    timestamps: true
});


module.exports = Produk;
