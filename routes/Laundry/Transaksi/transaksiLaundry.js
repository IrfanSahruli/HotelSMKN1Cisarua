const express = require("express");
const {
    createTransaksiLaundry,
    updateTransaksiLaundryStatus,
    getAllTransaksiLaundry,
    getTransaksiLaundryByStatus,
    deleteTransaksiLaundry
} = require("../../../controllers/Laundry/Transaksi/transaksiLaundry");
const protect = require("../../../middlewares/auth");

const router = express.Router();

router.post("/transaksilaundry", protect(["kasir"]), createTransaksiLaundry);
router.get("/transaksilaundry", protect(["kasir", "admin"]), getAllTransaksiLaundry);
router.get("/transaksilaundry/:status", protect(["kasir", "admin"]), getTransaksiLaundryByStatus);
router.put("/updatestatuslaundry/:id", protect(["kasir"]), updateTransaksiLaundryStatus);
router.delete("/transaksilaundry/:id", protect(["admin"]), deleteTransaksiLaundry);

module.exports = router;
