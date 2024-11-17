const express = require("express");
const protect = require("../../middlewares/auth");
const { reservasiHotel } = require("../../controllers/room/reservasi");
const { getOneForm } = require("../../controllers/room/checkinOut");
const router = express.Router();

router.post('/reservasi', protect('resepsionis'), reservasiHotel)
router.get('/One/:id', getOneForm)

module.exports = router;