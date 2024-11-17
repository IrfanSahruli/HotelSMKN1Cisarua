const sequelize = require("sequelize");
const TransaksiLaundry = require("../../../models/Laundry/Transaksi/transaksiLaundry");

const getMonthlyReport = async (req, res) => {
    try {
        const { tahun } = req.query; // Tahun diambil dari query parameter
        if (!tahun) {
            return res.status(400).json({ message: "Tahun wajib disertakan" });
        }

        // Query data bulanan
        const report = await TransaksiLaundry.findAll({
            attributes: [
                [sequelize.fn("MONTH", sequelize.col("date")), "bulan"],
                [sequelize.fn("SUM", sequelize.col("harga")), "total_pendapatan"],
                [sequelize.fn("COUNT", sequelize.col("id")), "total_transaksi"]
            ],
            where: sequelize.where(sequelize.fn("YEAR", sequelize.col("date")), tahun),
            group: [sequelize.fn("MONTH", sequelize.col("date"))],
            order: [[sequelize.fn("MONTH", sequelize.col("date")), "ASC"]]
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
                [sequelize.fn("YEAR", sequelize.col("date")), "tahun"],
                [sequelize.fn("SUM", sequelize.col("harga")), "total_pendapatan"],
                [sequelize.fn("COUNT", sequelize.col("id")), "total_transaksi"]
            ],
            group: [sequelize.fn("YEAR", sequelize.col("date"))],
            order: [[sequelize.fn("YEAR", sequelize.col("date")), "ASC"]]
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
    getMonthlyReport,
    getYearlyReport
}