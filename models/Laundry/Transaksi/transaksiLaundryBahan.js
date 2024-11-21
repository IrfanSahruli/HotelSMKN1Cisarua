const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/database");
const TransaksiLaundry = require("./transaksiLaundry");
const Bahan = require("./bahan");

const TransaksiLaundryBahan = sequelize.define("transaksiLaundryBahan", {
    transaksiLaundryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: TransaksiLaundry,
            key: "id"
        }
    },
    bahanId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Bahan,
            key: "id"
        }
    },
    jumlah: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    freezeTableName: true,
    timestamps: false
});

TransaksiLaundry.hasMany(TransaksiLaundryBahan, { foreignKey: "transaksiLaundryId" });
TransaksiLaundryBahan.belongsTo(TransaksiLaundry, { foreignKey: "transaksiLaundryId" });

Bahan.hasMany(TransaksiLaundryBahan, { foreignKey: "bahanId" });
TransaksiLaundryBahan.belongsTo(Bahan, { foreignKey: "bahanId" });

TransaksiLaundry.belongsToMany(Bahan, { through: TransaksiLaundryBahan, foreignKey: 'transaksiLaundryId' });
Bahan.belongsToMany(TransaksiLaundry, { through: TransaksiLaundryBahan, foreignKey: 'bahanId' });

module.exports = TransaksiLaundryBahan;
