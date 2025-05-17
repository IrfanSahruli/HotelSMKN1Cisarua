const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");
// const CheckinOut = require("./inOut");
// const ReservasiGroup = require("./reservasiG");
const RegistrasiGroup = require("./registrasiGLangsung");

const MakananR = sequelize.define('makananR', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    id_registrasi: {
        type: DataTypes.INTEGER,
        references: {
            model: RegistrasiGroup,
            key: 'id'
        }
    },
    meal: {
        type: DataTypes.STRING,
    },
    tours: {
        type: DataTypes.STRING
    },
    account: {
        type: DataTypes.STRING
    }
}, {
    freezeTableName: true,
    timestamps: true
})

RegistrasiGroup.hasMany(MakananR, { foreignKey: 'id_registrasi' });
MakananR.belongsTo(RegistrasiGroup, { foreignKey: 'id_registrasi' });

module.exports = MakananR;