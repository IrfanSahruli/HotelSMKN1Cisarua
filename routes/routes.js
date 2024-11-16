const router = require("express").Router();

//Users
router.use("/", require("./User/users"));

//Transaksi Laundry
router.use("/", require("./Laundry/Transaksi/transaksiLaundry"));

module.exports = router;