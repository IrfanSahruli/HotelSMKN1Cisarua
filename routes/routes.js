const router = require("express").Router();

//Users
router.use("/", require("./User/users"));

//room
router.use('/', require('./room/room'))
router.use('/', require('./room/reservasi'))
router.use('/', require('./room/checkinOut'))

module.exports = router;