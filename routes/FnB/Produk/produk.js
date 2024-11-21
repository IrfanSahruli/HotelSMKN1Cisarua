const express = require("express");
const {
    createProduk,
    getAllProduk,
    getProdukByKategori,
    updateProduk,
} = require("../../../controllers/FnB/Produk/produk");
const protect = require("../../../middlewares/auth");
const protectApp = require("../../../middlewares/authapp");
const upload = require("../../../middlewares/multer");

const router = express.Router();

router.post("/produk", upload.single("foto_produk"), protectApp(["admin"]), createProduk); //Tambah produk
router.get("/produk", protectApp(["admin", "kasir"]), getAllProduk); //Get semua produk
router.get("/produk/:kategori_produk", protectApp(["kasir"]), getProdukByKategori); //Get produk berdasarkan kategori
router.put("/produk/:id", upload.single("foto_produk"), protectApp(["admin"]), updateProduk); //Update produk berdasarkan id produk

module.exports = router;
