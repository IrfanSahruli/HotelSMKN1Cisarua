const express = require("express");
const {
    createTransaksiLaundry,
    updateTransaksiLaundryStatus,
    getInProcessTransaksiLaundry,
    getCompletedTransaksiLaundry
} = require("../../../controllers/Laundry/Transaksi/transaksiLaundry");
const protect = require("../../../middlewares/auth");

const router = express.Router();

router.post("/transaksilaundry", protect(["kasir"]), createTransaksiLaundry);
router.get("/transaksilaundry/proses", protect(["kasir"]), getInProcessTransaksiLaundry);
router.get("/transaksilaundry/selesai", protect(["admin"]), getCompletedTransaksiLaundry);
router.put("/updatestatuslaundry/:id", protect(["kasir"]), updateTransaksiLaundryStatus);

module.exports = router;
