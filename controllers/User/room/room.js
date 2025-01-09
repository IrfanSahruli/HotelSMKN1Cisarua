const Room = require("../../../models/room/room");

const createRoom = async(req, res) => {
    const { roomNo, roomType, harga } = req.body;
    try {
        const room = await Room.create({
            roomNo,
            roomType,
            harga
        })
        res.status(200).json(room)
    } catch (error) {
        res.status(500).json({message : error.message})
    }
}

module.exports = {
    createRoom
}