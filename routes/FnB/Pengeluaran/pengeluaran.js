const express = require('express');
const protectApp = require('../../../middlewares/authapp');
const {
    createPengeluaran,
    getPengeluaranByRange
} = require('../../../controllers/FnB/Pengeluaran/pengeluaran');

const router = express.Router();

router.post('/pengeluaran', protectApp(["admin"]), createPengeluaran);
router.get('/pengeluaran', protectApp(['admin']), getPengeluaranByRange);

module.exports = router;
