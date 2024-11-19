const Room = require("../../models/room/room");

const createRoom = async (req, res) => {
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
    const { harga } = req.body;
    try {
        const room = await Room.findByPk(id);
        if (!room) {
            return res.status(400).json({message : 'room tidak ditemukan'})
        }

        await Room.update({
            harga : harga
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

module.exports = {
    createRoom,
    getAllRoom,
    editRoom,
    roomOne
}