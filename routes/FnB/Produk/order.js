const express = require("express");
const { createTransaksi, getTransaksiOrder } = require("../../../controllers/FnB/Produk/transaksi");
const verifyToken = require("../../../middlewares/authKasir");
const router = express.Router();

router.post('/order', verifyToken, createTransaksi)
router.get('/transaksiOrder', getTransaksiOrder)


module.exports = router;

