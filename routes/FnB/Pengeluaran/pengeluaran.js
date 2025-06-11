const express = require('express');
const protectApp = require('../../../middlewares/authapp');
const {
    createPengeluaran,
    getPengeluaranPerhari,
    getPengeluaranPerMinggu,
    getPengeluaranPerBulan,
    getPengeluaranPerTahun
} = require('../../../controllers/FnB/Pengeluaran/pengeluaran');

const router = express.Router();

router.post('/pengeluaran', protectApp(["admin"]), createPengeluaran);
router.get('/pengeluaran/hari', protectApp(['admin']), getPengeluaranPerhari);
router.get('/pengeluaran/minggu', protectApp(['admin']), getPengeluaranPerMinggu);
router.get('/pengeluaran/bulan', protectApp(['admin']), getPengeluaranPerBulan);
router.get('/pengeluaran/tahun', protectApp(['admin']), getPengeluaranPerTahun);

module.exports = router;
