const { DataTypes, ENUM } = require("sequelize");
const sequelize = require("../../config/database");
// const User = require("../User/users");
const ReservasiGroup = require("./reservasiG");

const RegistrasiGroup = sequelize.define('registrasiGroup', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userIn: {
        type: DataTypes.STRING,
        allowNull: false
    },
    userOut: {
        type: DataTypes.STRING,
    },
    id_reservasi_group: {
        allowNull: true,
        type: DataTypes.INTEGER,
        references: {
            model: ReservasiGroup,
            key: 'id'
        }
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    metodeBooking: {
        type: DataTypes.ENUM('phone', 'letter', 'email', 'facsimile'),
        allowNull: false,
    },
    total: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    down: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    remaining: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    payment: {
        type: DataTypes.ENUM('cash', 'debit', 'transfer'),
        allowNull: false
    },
    adult: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    children: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    name_of_travel: {
        type: DataTypes.STRING,
        allowNull: false
    },
    orCompany: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    address: {
        type: DataTypes.STRING,
        allowNull: false
    },
    contact: {
        type: DataTypes.STRING,
        allowNull: false
    },
    clrek: {
        type: DataTypes.STRING,
        allowNull: false
    },
    dateC: {
        type: DataTypes.DATE,
        allowNull: false
    },
    followup: {
        type: DataTypes.ENUM('3 Months', '2 Months', '1 Months'),
        allowNull: true,
    },
    romming: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('in', 'out'),
        allowNull: false,
        defaultValue: 'in'
    },
    rack: {
        type: DataTypes.STRING,
        allowNull: false
    },
    initialDate: {
        type: DataTypes.STRING,
        allowNull: false
    },
    charter: {
        type: DataTypes.DATE,
        allowNull: false
    },
    front_desk: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    statusBill: {
        type: DataTypes.ENUM('selesai', 'belum'),
        allowNull: false,
        defaultValue: 'belum'
    }
}, {
    freezeTableName: true,
    timestamps: true
})

ReservasiGroup.hasMany(RegistrasiGroup, { foreignKey: 'id_reservasi_group' });
RegistrasiGroup.belongsTo(ReservasiGroup, { foreignKey: 'id_reservasi_group' });

module.exports = RegistrasiGroup;