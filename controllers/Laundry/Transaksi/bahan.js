const Bahan = require("../../../models/Laundry/Transaksi/bahan");

// Buat bahan baru
const createBahan = async (req, res) => {
    const { namaBahan, stokAwal } = req.body;

    try {
        // Pastikan stokAkhir otomatis mengikuti stokAwal
        const bahan = await Bahan.create({
            namaBahan,
            stokAwal,
            stokAkhir: stokAwal, // stokAkhir diatur sama dengan stokAwal
        });

        res.status(201).json({
            success: true,
            message: "Bahan berhasil dibuat",
            data: bahan,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Ambil semua bahan
const getAllBahan = async (req, res) => {
    try {
        const bahan = await Bahan.findAll();

        res.status(200).json({
            success: true,
            message: "Semua bahan berhasil diambil",
            data: bahan
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Ambil bahan berdasarkan ID
const getBahanById = async (req, res) => {
    const { id } = req.params;

    try {
        const bahan = await Bahan.findByPk(id);

        if (!bahan) {
            return res.status(404).json({
                success: false,
                message: "Bahan tidak ditemukan"
            });
        }

        res.status(200).json({
            success: true,
            message: "Bahan berhasil diambil",
            data: bahan
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Perbarui bahan berdasarkan ID
const updateBahan = async (req, res) => {
    const { id } = req.params;
    const { namaBahan, stokAwal, stokAkhir } = req.body;

    try {
        const bahan = await Bahan.findByPk(id);

        if (!bahan) {
            return res.status(404).json({
                success: false,
                message: "Bahan tidak ditemukan"
            });
        }

        const updatedBahan = await bahan.update({
            namaBahan: namaBahan ?? bahan.namaBahan,
            stokAwal: stokAwal ?? bahan.stokAwal,
            stokAkhir: stokAkhir ?? bahan.stokAkhir
        });

        res.status(200).json({
            success: true,
            message: "Bahan berhasil diperbarui",
            data: updatedBahan
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Hapus bahan berdasarkan ID
const deleteBahan = async (req, res) => {
    const { id } = req.params;

    try {
        const bahan = await Bahan.findByPk(id);

        if (!bahan) {
            return res.status(404).json({
                success: false,
                message: "Bahan tidak ditemukan"
            });
        }

        await bahan.destroy();

        res.status(200).json({
            success: true,
            message: "Bahan berhasil dihapus"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createBahan,
    getAllBahan,
    getBahanById,
    updateBahan,
    deleteBahan
};
