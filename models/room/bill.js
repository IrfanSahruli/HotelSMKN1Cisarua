const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");
const RegistrasiLangsung = require("./registrasiLangsung");
const RegistrasiGroup = require("./registrasiGLangsung");

const Bill = sequelize.define('bill', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    id_registrasi: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: RegistrasiLangsung
        }
    },
    id_registrasi_group: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: RegistrasiGroup
        }
    },
    detail: {
        type: DataTypes.STRING,
        allowNull: false
    },
    price: {
        type: DataTypes.STRING,
        allowNull: false
    },
}, {
    freezeTableName: true,
    timestamps: true
})

RegistrasiGroup.hasMany(Bill, { foreignKey: 'id_registrasi_group' });
Bill.belongsTo(RegistrasiGroup, { foreignKey: 'id_registrasi_group' });

RegistrasiLangsung.hasMany(Bill, { foreignKey: 'id_registrasi' });
Bill.belongsTo(RegistrasiLangsung, { foreignKey: 'id_registrasi' });

module.exports = Bill;