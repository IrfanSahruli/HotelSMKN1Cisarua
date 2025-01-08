const Reservasi = require("../../models/room/reservasi");
const Room = require("../../models/room/room");
const RoomG = require("../../models/room/roomG");

const createRoom = async (req, res) => {
    const { roomNo, roomType } = req.body;
    try {
        const room = await Room.create({
            roomNo,
            roomType,
            gabungan : roomNo + ' ' + roomType
        })

        res.status(200).json(room)
    } catch (error) {
        res.status(500).json({message : error.message})
    }
}

const getAllRoom = async (req, res) => {
    try {
        const room = await Room.findAll()
        res.status(200).json(room)
    } catch (error) {
        res.status(500).json({message : error.message})
    }
}

const editRoom = async (req, res) => {
    const id = req.params.id;
    const { statusRoom } = req.body;
    try {
        const room = await Room.findByPk(id);
        if (!room) {
            return res.status(400).json({message : 'room tidak ditemukan'})
        }

        await Room.update({
            statusRoom : statusRoom
        }, {
            where : {id : id}
        })

        const roomUpdate = await Room.findByPk(id);
        res.status(200).json(roomUpdate)
    } catch (error) {
        res.status(500).json({message : error.message})
    }
} 
    
const roomOne = async (req, res) => {
    const id = req.params.id;
    try {
        const room = await Room.findOne({
            where : {id : id}
        })
        res.status(200).json(room)
    } catch (error) {
        res.status(500).json({message : error.message})
    }
}

const filterRoom = async (req, res) => {
    const room = req.query.room;
    try {
        const roomF = await Reservasi.findAll({
            where: { room: room },
            attributes : ['checkin', 'checkout']
        })

         const roomG = await RoomG.findAll({
            where: { room: room },
            attributes : ['arrival', 'departure']
        })
        res.status(200).json({roomF, roomG })
    } catch (error) {
        res.status(500).json({message : error.message})
    }
}

const filterRoomGroup = async (req, res) => {
    const room = req.query.room;
    try {
        const roomF = await RoomG.findAll({
            where: { room: room },
            attributes : ['arrival', 'departure']
        })
        res.status(200).json(roomF)
    } catch (error) {
        res.status(500).json({message : error.message})
    }
}

module.exports = {
    createRoom,
    getAllRoom,
    editRoom,
    roomOne,
    filterRoom,
    filterRoomGroup
}