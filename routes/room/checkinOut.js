const express = require("express");
const protect = require("../../middlewares/auth");
const {
        getCheckin,
        getCheckout,
        Total,
        RegistrasiPersonal,
        getReservasiRegistrasi,
        hapusRservasi,
        readyToCheckout,
        getReservasiGroup,
        hapusReservasiGroup,
        getOneFormGroup,
        readyToCheckoutGroup,
        getReservasiGroupOut,
        TotalGroup,
  getReservasiGroupIn,
      } = require("../../controllers/room/checkinOut");
const {reservasiGroup2 } = require("../../controllers/room/reservasi");
const router = express.Router();

router.post('/regper', protect('resepsionis'), RegistrasiPersonal)
// router.put('/out/:id', protect('resepsionis'), checkOut)
router.get('/getIn', getCheckin)
router.get('/getOut', getCheckout)
router.get('/getTotal', Total)
router.get('/resrRegis', getReservasiRegistrasi)
router.delete('/cancel/:id', hapusRservasi)
router.put('/co/:id', protect('resepsionis'), readyToCheckout)
router.get('/group', getReservasiGroup)
router.delete('/reservasiGroup/:id', hapusReservasiGroup)
router.get('/getOneGroup/:id', getOneFormGroup)
router.put('/coGroup/:id',protect('resepsionis'), readyToCheckoutGroup)
router.get('/in', getReservasiGroupIn)
router.get('/co', getReservasiGroupOut)
router.get('/totalGroup', TotalGroup)
router.post('/reservasiGroup', protect('resepsionis'), reservasiGroup2)

module.exports = router;