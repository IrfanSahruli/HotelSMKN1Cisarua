const express = require("express");
const {
    createBahan,
    getAllBahan,
    getBahanById,
    updateBahan,
    deleteBahan
} = require("../../../controllers/Laundry/Transaksi/bahan");
const protect = require("../../../middlewares/auth");

const router = express.Router();

router.post("/bahan", protect(["admin"]), createBahan); // Buat bahan baru
router.get("/bahan", protect(["admin", "kasir"]), getAllBahan); // Ambil semua bahan
router.get("/bahan/:id", protect(["admin", "kasir"]), getBahanById); // Ambil bahan berdasarkan ID
router.put("/bahan/:id", protect(["admin"]), updateBahan); // Perbarui bahan berdasarkan ID
router.delete("/bahan/:id", protect(["admin"]), deleteBahan); // Hapus bahan berdasarkan ID

module.exports = router;
