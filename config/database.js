const Sequelize = require("sequelize");
const dotenv = require("dotenv");
dotenv.config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.nama, process.env.PASSWORD, {
    host: process.env.HOST,
    dialect: 'mysql',
    logging: console.log  // Aktifkan logging query SQL di konsol
});

module.exports = sequelize;