const { Sequelize } = require("sequelize");
const Produk = require("../../../models/FnB/Produk/produk");
const dotenv = require("dotenv");
dotenv.config();

const createProduk = async (req, res) => {
    const foto_produk = req.file ? `/uploads/${req.file.filename}` : null;
    const { judul_produk, harga, kategori_produk, sub_kategori_produk } = req.body;

    try {
        // Periksa apakah file foto diunggah
        if (!req.file) {
            return res.status(400).json({ success: false, message: "Foto produk harus diunggah" });
        }

        // Simpan data produk ke database
        const produk = await Produk.create({
            judul_produk,
            foto_produk,
            harga,
            kategori_produk,
            sub_kategori_produk
        });

        res.status(201).json({
            success: true,
            message: "Produk berhasil dibuat",
            data: produk
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getAllProduk = async (req, res) => {
    try {
        // Ambil semua data produk
        const produk = await Produk.findAll();

        res.status(200).json({
            success: true,
            message: "Semua produk berhasil diambil",
            data: produk
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getProdukBySubKategori = async (req, res) => {
    const { sub_kategori_produk } = req.params; // Ambil kategori dari parameter URL

    try {
        // Ambil data produk berdasarkan kategori
        const produk = await Produk.findAll({
            where: { sub_kategori_produk }
        });

        // Jika produk tidak ditemukan
        if (produk.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Tidak ada produk dengan sub kategori ${sub_kategori_produk}`
            });
        }

        res.status(200).json({
            success: true,
            message: `Produk dengan sub kategori ${sub_kategori_produk} berhasil diambil`,
            data: produk
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateProduk = async (req, res) => {
    const { id } = req.params; // ID produk dari parameter URL
    const foto_produk = req.file ? `/uploads/${req.file.filename}` : null;
    const { judul_produk, harga, kategori_produk, sub_kategori_produk } = req.body;

    try {
        // Cari produk berdasarkan ID
        const produk = await Produk.findByPk(id);

        // Jika produk tidak ditemukan
        if (!produk) {
            return res.status(404).json({ success: false, message: "Produk tidak ditemukan" });
        }

        // Update data produk menggunakan instance
        const updatedProduk = await produk.update({
            judul_produk: judul_produk || produk.judul_produk,
            foto_produk: foto_produk || produk.foto_produk,
            harga: harga || produk.harga,
            kategori_produk: kategori_produk || produk.kategori_produk,
            sub_kategori_produk: sub_kategori_produk || produk.sub_kategori_produk,
        });

        res.status(200).json({
            success: true,
            message: "Produk berhasil diperbarui",
            data: updatedProduk, // Respons dengan data produk yang sudah diupdate
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createProduk,
    getAllProduk,
    getProdukBySubKategori,
    updateProduk,
};
