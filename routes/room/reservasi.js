const express = require("express");
const protect = require("../../middlewares/auth");
const { reservasiHotel } = require("../../controllers/room/reservasi");
const { getOneForm, getReservasi } = require("../../controllers/room/checkinOut");
const router = express.Router();

router.post('/reservasi', protect('resepsionis'), reservasiHotel)
router.get('/One/:id', getOneForm)
router.get('/getReservasi', getReservasi)

module.exports = router;