const router = require("express").Router();

//Users
router.use("/", require("./User/users"));

//room
router.use('/', require('./room/room'))
router.use('/', require('./room/reservasi'))
router.use('/', require('./room/checkinOut'))
//Transaksi Laundry
router.use("/", require("./Laundry/Transaksi/transaksiLaundry"));

//Laporan
router.use("/", require("./Laundry/Laporan/pendapatan"));

//Produk FnB
router.use("/", require("./FnB/Produk/produk"));

module.exports = router;