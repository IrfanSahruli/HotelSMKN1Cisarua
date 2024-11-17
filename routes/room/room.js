const express = require("express");
const protect = require("../../middlewares/auth");
const { createRoom, getAllRoom, editRoom } = require("../../controllers/room/room");
const router = express.Router();

router.post('/room', createRoom)
router.get('/getRoom', getAllRoom)
router.put('/editroom/:id', editRoom)


module.exports = router;

