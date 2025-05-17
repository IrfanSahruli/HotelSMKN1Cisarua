const express = require("express");
const protect = require("../../middlewares/auth");
const { reservasiHotel, editReservasiHotel, editreservasiGroup } = require("../../controllers/room/reservasi");
const { getOneForm, getReservasi } = require("../../controllers/room/checkinOut");
const router = express.Router();

router.post('/reservasi', protect('resepsionis'), reservasiHotel)
router.get('/One/:id', getOneForm)
router.get('/getReservasi', getReservasi)
router.put('/editPersonal/:id', editReservasiHotel)
router.put('/editGroup/:id', editreservasiGroup)

module.exports = router;