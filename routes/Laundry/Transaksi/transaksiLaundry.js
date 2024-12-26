const express = require("express");
const {
    createTransaksiLaundry,
    updateDpTransaksiLaundry,
    updateTransaksiLaundryStatus,
    getAllTransaksiLaundry,
    getTransaksiLaundryByStatus,
    getTransaksiLaundryById,
    deleteTransaksiLaundry
} = require("../../../controllers/Laundry/Transaksi/transaksiLaundry");
const protect = require("../../../middlewares/auth");

const router = express.Router();

router.post("/transaksilaundry", protect(["kasir"]), createTransaksiLaundry);
router.put("/transaksilaundry/dp/:id", protect(["kasir"]), updateDpTransaksiLaundry);
router.put("/updatestatuslaundry/:id", protect(["kasir"]), updateTransaksiLaundryStatus);
router.get("/transaksilaundry/id/:id", protect(["kasir"]), getTransaksiLaundryById);
router.get("/transaksilaundry", protect(["kasir", "admin"]), getAllTransaksiLaundry);
router.get("/transaksilaundry/:status", protect(["kasir", "admin"]), getTransaksiLaundryByStatus);
router.delete("/transaksilaundry/:id", protect(["admin"]), deleteTransaksiLaundry);

module.exports = router;
