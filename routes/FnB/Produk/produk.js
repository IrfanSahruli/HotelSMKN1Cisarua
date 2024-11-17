const express = require("express");
const {
    createProduk,
    getAllProduk,
    getProdukBySubKategori,
    updateProduk
} = require("../../../controllers/FnB/Produk/produk");
const protect = require("../../../middlewares/auth");
const upload = require("../../../middlewares/multer");

const router = express.Router();

router.post("/produk", upload.single("foto_produk"), createProduk); //Tambah produk
router.get("/produk", getAllProduk); //Get semua produk
router.get("/produk/:sub_kategori_produk", getProdukBySubKategori); //Get produk berdasarkan sub kategori
router.put("/produk/:id", upload.single("foto_produk"), updateProduk); //Update produk berdasarkan id produk

module.exports = router;
