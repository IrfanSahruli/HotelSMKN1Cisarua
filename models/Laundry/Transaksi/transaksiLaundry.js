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
        type: DataTypes.STRING
    },
    customer: {
        type: DataTypes.STRING
    },
    timeIn: {
        type: DataTypes.TIME
    },
    checkByIn: {
        type: DataTypes.INTEGER,
        references: {
            model: User, // Tabel user sebagai referensi
            key: "id"
        }
    },
    itemType: {
        type: DataTypes.STRING
    },
    pcs: {
        type: DataTypes.INTEGER
    },
    color_description: {
        type: DataTypes.STRING
    },
    brand: {
        type: DataTypes.STRING
    },
    care_instruction: {
        type: DataTypes.STRING
    },
    remarks: {
        type: DataTypes.STRING
    },
    personInCharge: {
        type: DataTypes.STRING
    },
    supplyUsed: {
        type: DataTypes.STRING
    },
    checkByOut: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: "id"
        }
    },
    timeOut: {
        type: DataTypes.TIME
    },
    weight: {
        type: DataTypes.INTEGER
    },
    harga: {
        type: DataTypes.INTEGER
    },
    status: {
        type: DataTypes.ENUM,
        values: ["proses", "selesai"]
    }
}, {
    freezeTableName: true
});

User.hasMany(TransaksiLaundry, { foreignKey: "checkByIn", as: 'checkByInUser' });
TransaksiLaundry.belongsTo(User, { foreignKey: "checkByIn", as: 'checkByInUser' });

User.hasMany(TransaksiLaundry, { foreignKey: "checkByOut", as: 'checkByOutUser' });
TransaksiLaundry.belongsTo(User, { foreignKey: "checkByOut", as: 'checkByOutUser' });

module.exports = TransaksiLaundry;