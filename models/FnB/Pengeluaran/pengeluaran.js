const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database');

const Pengeluaran = sequelize.define('pengeluaran', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    nama_barang: {
        type: DataTypes.STRING,
        allowNull: false
    },
    jumlah: {
        type: DataTypes.STRING,
        allowNull: false
    },
    harga: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    freezeTableName: true
});

module.exports = Pengeluaran;
