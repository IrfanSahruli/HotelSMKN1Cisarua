const Remarks = require("../../models/room/remarks");
const Reservasi = require("../../models/room/reservasi");
const moment = require("moment");
const Room = require("../../models/room/room");
const User = require("../../models/User/users");
const { Op } = require("sequelize");

const reservasiHotel = async (req, res) => {
    const { id } = req.user;
    const {
        name,
        checkin,
        checkout,
        roomNo,
        roomType,
        email,
        phone,
        children,
        adult,
        remarks
    } = req.body;
    try {
       let totalRemarks = 0;
       let totalSemua = 0;
       let totalRoom = 0;
       let jumlahTotal = 0;

        const noRoom = await Room.findOne({ where: { roomNo: roomNo } });
        if (!noRoom) {
            return res.status(400).json({ message: 'room not found' });
        }

        const conflictingReservations = await Reservasi.findOne({
            where: {
                roomNo: roomNo,
                [Op.or]: [
                    { checkin: { [Op.between]: [checkin, checkout] } },
                    { checkout: { [Op.between]: [checkin, checkout] } },
                    {
                        [Op.and]: [
                            { checkin: { [Op.lte]: checkin } },
                            { checkout: { [Op.gte]: checkout } },
                        ],
                    },
                ],
            },
        });

        if (conflictingReservations) {
            return res.status(400).json({ message: 'Room is already reserved during the specified time' });
        }

        const resepsionis = await User.findByPk(id);
        const namaResepsionis = resepsionis.username;

        // const tanggalIn = moment(checkin, "HH-MM-TTTT").format('TTTT-MM-HH');
        // const tanggalOut = moment(checkout, "HH-MM-TTTT").format('TTTT-MM-HH');

        const reservasi = await Reservasi.create({
            userId: id,
            bookedBy: namaResepsionis,
            name,
            checkin,//: tanggalIn,
            checkout,//: tanggalOut,
            roomNo,
            roomType,
            email,
            phone,
            children,
            adult,
            subTotalRemarks: totalRemarks,
            subTotalRoom: totalRoom,
            total: totalSemua
        });

        if (remarks) {
            for (let index = 0; index < remarks.length; index++) {
                const { detail, price } = remarks[index];
                await Remarks.create({
                    id_reservasi: reservasi.id,
                    detail,
                    price,
                });
                jumlahTotal += price;
            }
        }

        const harga_permalam = noRoom.harga;
        const jamIn = new Date(checkin);
        const jamOut = new Date(checkout);
        const totalMalam = Math.ceil((jamOut - jamIn) / (1000 * 60 * 60 * 24));

        const totalPermalam = totalMalam * harga_permalam;
        const jumlahSemua = totalPermalam + jumlahTotal;

        console.log(jumlahTotal);
        console.log(totalPermalam);
        

        await reservasi.update({
            subTotalRemarks: jumlahTotal,
            subTotalRoom: totalPermalam,
            total: jumlahSemua
        });

        res.status(200).json(reservasi);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


module.exports = {
    reservasiHotel
}