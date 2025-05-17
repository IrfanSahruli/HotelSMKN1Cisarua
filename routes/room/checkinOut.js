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
      RegistrasiPersonalLangsung,
      registrasiGroup,
      registrasiGroupLangsung,
      getReservasiGroupR,
      getRegistrasi,
      getRegistrasiGroup,
      editRegistrasiGroup,
      editRegistrasiPersonal,
      getOneRegistrasiGroup,
      getOneRegistrasiPersonal,
      CreateBill,
      editBill,
      hapusRservasiGroup,
} = require("../../controllers/room/checkinOut");
const { reservasiGroup2 } = require("../../controllers/room/reservasi");
const router = express.Router();

router.post('/regper', protect('resepsionis'), RegistrasiPersonal)
router.post('/reggroup', protect('resepsionis'), registrasiGroup)
// router.post('/regla', protect('resepsionis'), RegistrasiPersonalLangsung)
// router.put('/out/:id', protect('resepsionis'), checkOut)
router.get('/getIn', getCheckin)
router.get('/getOut', getCheckout)
router.get('/getTotal', Total)
router.get('/resrRegis', getReservasiRegistrasi)
router.delete('/cancel/:id', hapusRservasi)
router.delete('/cancelG/:id', hapusRservasiGroup)
router.put('/co/:id', protect('resepsionis'), readyToCheckout)
router.get('/group', getReservasiGroup)
router.get('/groupR', getReservasiGroupR)
router.delete('/reservasiGroup/:id', hapusReservasiGroup)
router.get('/getOneGroup/:id', getOneFormGroup)
router.put('/coGroup/:id', protect('resepsionis'), readyToCheckoutGroup)
router.get('/in', getReservasiGroupIn)
router.get('/co', getReservasiGroupOut)
router.get('/totalGroup', TotalGroup)
router.post('/reservasiGroup', protect('resepsionis'), reservasiGroup2)
router.post('/registrasiP', protect('resepsionis'), RegistrasiPersonalLangsung)
router.post('/registrasiG', protect('resepsionis'), registrasiGroupLangsung)
router.get('/regisP', getRegistrasi)
router.get('/regisG', getRegistrasiGroup)
router.put('/editRGroup/:id', protect('resepsionis'), editRegistrasiGroup)
router.put('/editRPersonal/:id', protect('resepsionis'), editRegistrasiPersonal)
router.get('/oneGroup/:id', getOneRegistrasiGroup)
router.get('/onePersonal/:id', getOneRegistrasiPersonal)
router.post('/bill', CreateBill)
router.put('/editBill', editBill)

module.exports = router;