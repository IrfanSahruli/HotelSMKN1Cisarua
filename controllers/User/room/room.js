const RoomData = require("../../../models/room/dataRoom");
// const Room = require("../../../models/room/room");

const createRoom = async (req, res) => {
    const { roomNo, roomType, rate } = req.body;
    try {
        const room = await RoomData.create({
            roomNo,
            roomType,
            rate
        })
        res.status(200).json(room)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

module.exports = {
    createRoom
}