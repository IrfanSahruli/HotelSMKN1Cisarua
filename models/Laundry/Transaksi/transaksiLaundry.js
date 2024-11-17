const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/database");
const User = require("../../User/users");

const TransaksiLaundry = sequelize.define("transaksi laundry", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    customer: {
        type: DataTypes.STRING,
        allowNull: true
    },
    timeIn: {
        type: DataTypes.TIME,
        allowNull: true
    },
    checkByIn: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: User, // Tabel user sebagai referensi
            key: "id"
        }
    },
    itemType: {
        type: DataTypes.STRING,
        allowNull: true
    },
    pcs: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    color_description: {
        type: DataTypes.STRING,
        allowNull: true
    },
    brand: {
        type: DataTypes.STRING,
        allowNull: true
    },
    care_instruction: {
        type: DataTypes.STRING,
        allowNull: true
    },
    remarks: {
        type: DataTypes.STRING,
        allowNull: true
    },
    personInCharge: {
        type: DataTypes.STRING,
        allowNull: true
    },
    supplyUsed: {
        type: DataTypes.STRING,
        allowNull: true
    },
    checkByOut: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: User,
            key: "id"
        }
    },
    timeOut: {
        type: DataTypes.TIME,
        allowNull: true
    },
    weight: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    harga: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM,
        values: ["proses", "selesai"],
        allowNull: true
    }
}, {
    freezeTableName: true,
    timestamps: true
});

User.hasMany(TransaksiLaundry, { foreignKey: "checkByIn", as: 'checkByInUser' });
TransaksiLaundry.belongsTo(User, { foreignKey: "checkByIn", as: 'checkByInUser' });

User.hasMany(TransaksiLaundry, { foreignKey: "checkByOut", as: 'checkByOutUser' });
TransaksiLaundry.belongsTo(User, { foreignKey: "checkByOut", as: 'checkByOutUser' });

module.exports = TransaksiLaundry;