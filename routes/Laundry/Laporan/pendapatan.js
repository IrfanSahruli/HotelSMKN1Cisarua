const express = require("express");
const {
    getMonthlyReport,
    getYearlyReport
} = require("../../../controllers/Laundry/Laporan/pendapatan");
const protect = require("../../../middlewares/auth");

const router = express.Router();

router.get("/pendapatan/perbulan", protect(["admin"]), getMonthlyReport); // pake /perbulan?tahun=2024
router.get("/pendapatan/pertahun", protect(["admin"]), getYearlyReport);

module.exports = router;
