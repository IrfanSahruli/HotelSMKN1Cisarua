const sequelize = require("sequelize");
const TransaksiLaundry = require("../../../models/Laundry/Transaksi/transaksiLaundry");

const getAllIncome = async (req, res) => {
    try {
        const report = await TransaksiLaundry.findAll({
            attributes: [
                [sequelize.fn("SUM", sequelize.col("harga")), "total_pendapatan"],
                [sequelize.fn("COUNT", sequelize.col("id")), "total_transaksi"]
            ]
        });

        // Ekstrak nilai total_pendapatan dan total_transaksi
        const totalPendapatan = parseFloat(report[0].getDataValue("total_pendapatan") || 0);
        const totalTransaksi = parseInt(report[0].getDataValue("total_transaksi") || 0);

        res.status(200).json({
            message: "Laporan semua pendapatan",
            total_pendapatan: totalPendapatan,
            total_transaksi: totalTransaksi
        });
    } catch (error) {
        res.status(500).json({
            message: "Gagal mengambil laporan pendapatan",
            error: error.message
        });
    }
};

const getDailyReport = async (req, res) => {
    try {
        // Query untuk laporan pendapatan harian
        const report = await TransaksiLaundry.findAll({
            attributes: [
                [sequelize.fn("DATE", sequelize.col("dateIn")), "tanggal"],
                [sequelize.fn("SUM", sequelize.col("harga")), "total_pendapatan"],
                [sequelize.fn("COUNT", sequelize.col("id")), "total_transaksi"]
            ],
            group: [sequelize.fn("DATE", sequelize.col("dateIn"))],
            order: [[sequelize.fn("DATE", sequelize.col("dateIn")), "ASC"]]
        });

        // Respon dengan hasil laporan harian
        res.status(200).json({
            message: "Laporan pendapatan harian",
            data: report
        });
    } catch (error) {
        res.status(500).json({
            message: "Gagal mengambil laporan pendapatan harian",
            error: error.message
        });
    }
};

const getMonthlyReport = async (req, res) => {
    try {
        const { tahun } = req.query; // Tahun diambil dari query parameter
        if (!tahun) {
            return res.status(400).json({ message: "Tahun wajib disertakan" });
        }

        // Query data bulanan
        const report = await TransaksiLaundry.findAll({
            attributes: [
                [sequelize.fn("MONTH", sequelize.col("dateIn")), "bulan"],
                [sequelize.fn("SUM", sequelize.col("harga")), "total_pendapatan"],
                [sequelize.fn("COUNT", sequelize.col("id")), "total_transaksi"]
            ],
            where: sequelize.where(sequelize.fn("YEAR", sequelize.col("dateIn")), tahun),
            group: [sequelize.fn("MONTH", sequelize.col("dateIn"))],
            order: [[sequelize.fn("MONTH", sequelize.col("dateIn")), "ASC"]]
        });

        // Hitung total pendapatan dan total transaksi untuk seluruh tahun
        const totalIncome = report.reduce((sum, record) => sum + parseFloat(record.getDataValue('total_pendapatan') || 0), 0);
        const totalTransactions = report.reduce((count, record) => count + parseInt(record.getDataValue('total_transaksi') || 0), 0);

        // Respon
        res.status(200).json({
            message: `Laporan pendapatan bulanan tahun ${tahun}`,
            total_pendapatan: totalIncome,
            total_transaksi: totalTransactions,
            data: report
        });
    } catch (error) {
        res.status(500).json({
            message: "Gagal mengambil laporan pendapatan bulanan",
            error: error.message
        });
    }
};

const getYearlyReport = async (req, res) => {
    try {
        const report = await TransaksiLaundry.findAll({
            attributes: [
                [sequelize.fn("YEAR", sequelize.col("dateIn")), "tahun"],
                [sequelize.fn("SUM", sequelize.col("harga")), "total_pendapatan"],
                [sequelize.fn("COUNT", sequelize.col("id")), "total_transaksi"]
            ],
            group: [sequelize.fn("YEAR", sequelize.col("dateIn"))],
            order: [[sequelize.fn("YEAR", sequelize.col("dateIn")), "ASC"]]
        });

        res.status(200).json({
            message: "Laporan pendapatan tahunan",
            data: report
        });
    } catch (error) {
        res.status(500).json({
            message: "Gagal mengambil laporan pendapatan tahunan",
            error: error.message
        });
    }
};

module.exports = {
    getAllIncome,
    getDailyReport,
    getMonthlyReport,
    getYearlyReport
}