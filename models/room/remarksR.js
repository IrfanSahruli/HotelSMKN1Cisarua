const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");
const Reservasi = require("./reservasi");
// const Registrasi = require("./inOut");
const ReservasiGroup = require("./reservasiG");
const RegistrasiLangsung = require("./registrasiLangsung");
const RegistrasiGroup = require("./registrasiGLangsung");

const RemarksR = sequelize.define('remarksR', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    // id_registrasi: {
    //     type: DataTypes.INTEGER,
    //     allowNull: true,
    //     references: {
    //         model: Registrasi,
    //         key: 'id'
    //     }
    // },
    id_registrasi: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: RegistrasiGroup,
            key: 'id'
        }
    },
    id_registrasiP: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: RegistrasiLangsung,
            key: 'id'
        }
    },
    detail: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    freezeTableName: true,
    timestamps: true
})

// Registrasi.hasMany(RemarksR, { foreignKey: 'id_registrasi' });
// RemarksR.belongsTo(Registrasi, { foreignKey: 'id_registrasi' });

RegistrasiGroup.hasMany(RemarksR, { foreignKey: 'id_registrasi', as: 'regis' });
RemarksR.belongsTo(RegistrasiGroup, { foreignKey: 'id_registrasi' });

RegistrasiLangsung.hasMany(RemarksR, { foreignKey: 'id_registrasiP', as: 'regisP' });
RemarksR.belongsTo(RegistrasiLangsung, { foreignKey: 'id_registrasiP' });

module.exports = RemarksR;