const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/database");

const TransaksiLaundry = sequelize.define("transaksi laundry", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },

})