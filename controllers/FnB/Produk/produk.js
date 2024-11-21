const { Sequelize } = require("sequelize");
const Produk = require("../../../models/FnB/Produk/produk");
const dotenv = require("dotenv");
dotenv.config();

// Buat produk baru
const createProduk = async (req, res) => {
    const foto_produk = req.file ? `/uploads/${req.file.filename}` : null;
    const {
        judul_produk,
        hargaAwal,
        hargaJual,
        stok,
        kategori_produk,
        sub_kategori_produk,
    } = req.body;

    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Foto produk harus diunggah",
            });
        }

        const produk = await Produk.create({
            judul_produk,
            foto_produk,
            hargaAwal,
            hargaJual,
            stok,
            kategori_produk,
            sub_kategori_produk,
        });

        res.status(201).json({
            success: true,
            message: "Produk berhasil dibuat",
            data: produk,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Ambil semua produk
const getAllProduk = async (req, res) => {
    try {
        const produk = await Produk.findAll();
        res.status(200).json({
            success: true,
            message: "Semua produk berhasil diambil",
            data: produk,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Ambil produk berdasarkan kategori
const getProdukByKategori = async (req, res) => {
    const { kategori_produk } = req.params;

    try {
        const produk = await Produk.findAll({
            where: { kategori_produk },
        });

        if (produk.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Tidak ada produk dengan kategori ${kategori_produk}`,
            });
        }

        res.status(200).json({
            success: true,
            message: `Produk dengan kategori ${kategori_produk} berhasil diambil`,
            data: produk,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Ambil produk berdasarkan sub kategori
const getProdukBySubKategori = async (req, res) => {
    const { sub_kategori_produk } = req.params;

    try {
        const produk = await Produk.findAll({
            where: { sub_kategori_produk },
        });

        if (produk.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Tidak ada produk dengan sub kategori ${sub_kategori_produk}`,
            });
        }

        res.status(200).json({
            success: true,
            message: `Produk dengan sub kategori ${sub_kategori_produk} berhasil diambil`,
            data: produk,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Ambil produk terbaru
const getProdukTerbaru = async (req, res) => {
    const { limit } = req.query; // Batas jumlah produk yang diambil, opsional

    try {
        // Ambil produk terbaru berdasarkan waktu pembuatan
        const produk = await Produk.findAll({
            order: [["createdAt", "DESC"]],
            limit: limit ? parseInt(limit) : 10, // Default ambil 10 produk terbaru jika limit tidak diberikan
        });

        if (produk.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Tidak ada produk terbaru yang tersedia",
            });
        }

        res.status(200).json({
            success: true,
            message: "Produk terbaru berhasil diambil",
            data: produk,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Perbarui produk berdasarkan ID
const updateProduk = async (req, res) => {
    const { id } = req.params;
    const foto_produk = req.file ? `/uploads/${req.file.filename}` : null;
    const {
        judul_produk,
        hargaAwal,
        hargaJual,
        stok,
        kategori_produk,
        sub_kategori_produk,
    } = req.body;

    try {
        const produk = await Produk.findByPk(id);

        if (!produk) {
            return res.status(404).json({
                success: false,
                message: "Produk tidak ditemukan",
            });
        }

        const updatedProduk = await produk.update({
            judul_produk: judul_produk || produk.judul_produk,
            foto_produk: foto_produk || produk.foto_produk,
            hargaAwal: hargaAwal || produk.hargaAwal,
            hargaJual: hargaJual || produk.hargaJual,
            stok: stok || produk.stok,
            kategori_produk: kategori_produk || produk.kategori_produk,
            sub_kategori_produk: sub_kategori_produk || produk.sub_kategori_produk,
        });

        res.status(200).json({
            success: true,
            message: "Produk berhasil diperbarui",
            data: updatedProduk,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Hapus produk berdasarkan ID
const deleteProduk = async (req, res) => {
    const { id } = req.params;

    try {
        const produk = await Produk.findByPk(id);

        if (!produk) {
            return res.status(404).json({
                success: false,
                message: "Produk tidak ditemukan",
            });
        }

        await produk.destroy();

        res.status(200).json({
            success: true,
            message: "Produk berhasil dihapus",
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createProduk,
    getAllProduk,
    getProdukByKategori,
    getProdukBySubKategori,
    getProdukTerbaru,
    updateProduk,
    deleteProduk,
};
