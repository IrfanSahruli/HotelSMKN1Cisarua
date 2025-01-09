const express = require("express");
const protect = require("../../middlewares/auth");
const { createRoom, getAllRoom, editRoom, roomOne, filterRoom, filterRoomGroup } = require("../../controllers/room/room");
const router = express.Router();

router.post('/room', createRoom)
router.get('/getRoom', getAllRoom)
router.put('/editroom/:id', editRoom)
router.get('/oneRoom/:id', roomOne)
router.get('/filter', filterRoom)
router.get('/filterGroup', filterRoomGroup)


module.exports = router;

