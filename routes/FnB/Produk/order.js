const express = require("express");
const { createTransaksi, getTransaksiOrder, deleteRiwayat, totalPemasukkan } = require("../../../controllers/FnB/Produk/transaksi");
const verifyToken = require("../../../middlewares/authKasir");
const router = express.Router();

router.post('/order', verifyToken, createTransaksi)
router.get('/transaksiOrder', verifyToken, getTransaksiOrder)
router.delete('/deleteHistory/:id', verifyToken, deleteRiwayat)
router.get('/totalTransaksi', verifyToken, totalPemasukkan)


module.exports = router;

