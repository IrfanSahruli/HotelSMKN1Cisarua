const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");
const Reservasi = require("./reservasi");
// const ReservasiGroup = require("./reservasiG");

const RegistrasiLangsung = sequelize.define('registrasiLangsung', {
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
    id_reservasi: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: Reservasi,
            key: 'id'
        }
    },
    // id_reservasi_group: {
    //     allowNull: true,
    //     type: DataTypes.INTEGER,
    //     references: {
    //         model: ReservasiGroup,
    //         key: 'id'
    //     }
    // },
    fullname: {
        type: DataTypes.STRING,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    address: {
        type: DataTypes.STRING,
        allowNull: false
    },
    postal: {
        type: DataTypes.STRING,
        allowNull: false
    },
    id_number: {
        type: DataTypes.STRING,
        allowNull: false
    },
    itype: {
        type: DataTypes.ENUM('KTP/SIM', 'Passport'),
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    deposit: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    total: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    remaining: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    paymentmethod: {
        type: DataTypes.STRING,
        allowNull: false
    },
    cardNo: {
        type: DataTypes.INTEGER,
        // allowNull : false
    },
    cvv: {
        type: DataTypes.STRING,
        // allowNull: false,
    },
    exp: {
        type: DataTypes.DATE,
    },
    front_desk: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('in', 'out'),
        defaultValue: 'in'
    },
    nationality: {
        type: DataTypes.STRING,
        allowNull: false
    },
    birth: {
        type: DataTypes.STRING,
        allowNull: false
    },
    loyalNumber: {
        type: DataTypes.STRING,
        allowNull: false
    },
    loyalLevel: {
        type: DataTypes.STRING,
        allowNull: false
    },
    adult: {
        type: DataTypes.STRING,
        allowNull: false
    },
    children: {
        type: DataTypes.STRING,
        allowNull: false
    },
    // rate: {
    //     type: DataTypes.INTEGER,
    //     allowNull: false,
    // },
    // room: {
    //     type: DataTypes.STRING,
    //     allowNull: false
    // },
    stay: {
        type: DataTypes.STRING,
        allowNull: false
    },
    checkin: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    checkout: {
        type: DataTypes.DATEONLY,
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

Reservasi.hasMany(RegistrasiLangsung, { foreignKey: 'id_reservasi' });
RegistrasiLangsung.belongsTo(Reservasi, { foreignKey: 'id_reservasi' });

// ReservasiGroup.hasMany(RegistrasiLangsung, { foreignKey: 'id_reservasi_group' });
// RegistrasiLangsung.belongsTo(ReservasiGroup, { foreignKey: 'id_reservasi_group' });

module.exports = RegistrasiLangsung;