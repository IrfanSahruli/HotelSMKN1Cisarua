const router = require("express").Router();

//Users
router.use("/", require("./User/users"));

//Bahan Laundry
router.use("/", require("./Laundry/Transaksi/bahan"));

//Transaksi Laundry
router.use("/", require("./Laundry/Transaksi/transaksiLaundry"));

//Laporan
router.use("/", require("./Laundry/Laporan/pendapatan"));

//Produk FnB
router.use("/", require("./FnB/Produk/produk"));

module.exports = router;