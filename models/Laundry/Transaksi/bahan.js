const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/database");

const Bahan = sequelize.define("bahan", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    namaBahan: {
        type: DataTypes.STRING,
        allowNull: true
    },
    stokAwal: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    stokAkhir: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    freezeTableName: true,
    timestamps: true
});

module.exports = Bahan;
