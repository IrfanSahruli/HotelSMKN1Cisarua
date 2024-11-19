const express = require("express");
const protect = require("../../middlewares/auth");
const { checkIn, checkOut, getCheckin, getCheckout, Total } = require("../../controllers/room/checkinOut");
const router = express.Router();

router.post('/checkin', protect('resepsionis'), checkIn)
router.put('/out/:id', protect('resepsionis'), checkOut)
router.get('/getIn', getCheckin)
router.get('/getOut', getCheckout)
router.get('/getTotal', Total)

module.exports = router;