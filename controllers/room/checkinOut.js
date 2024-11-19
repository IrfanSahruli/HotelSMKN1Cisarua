const CheckinOut = require("../../models/room/inOut");
const Other = require("../../models/room/other");
const Remarks = require("../../models/room/remarks");
const Reservasi = require("../../models/room/reservasi");
const Room = require("../../models/room/room");
const User = require("../../models/User/users");
const moment = require("moment");

const checkIn = async (req, res) => {
    const { id_reservasi, checkin, checkout, wakeUp, national, purpose, paymentIn, description } = req.body;
    const id = req.user.id
    try {
        const user = await User.findByPk(id)
        if (!user) {
            return res.status(400).json({ message: 'user not found' });
        }

        if (!['cash', 'debit'].includes(paymentIn)) {
             return res.status(400).json({ message: 'payment method tidak tersedia' });
        }

        const idReservasi = await Reservasi.findByPk(id_reservasi)
        const roomStatus = await Room.findOne({ where: { roomNo: idReservasi.roomNo } });

        if (!roomStatus) {
            return res.status(404).json({ message: 'Room tidak ditemukan' });
        }

        const roomStatusValue = roomStatus.statusRoom;

        if (roomStatusValue === 'booked') {
            return res.status(400).json({ message: 'Kamar sudah diisi' });
        }
        // const tanggalIn = moment(checkin, "DD-MM-YYYY").format('YYYY-MM-DD');
        // const tanggalOut = moment(checkout, "DD-MM-YYYY").format('YYYY-MM-DD');
        // const wakeup = moment(wakeUp, "DD-MM-YYYY HH:mm:ss").format('YYYY-MM-DD HH:mm:ss');

        const inCheck = await CheckinOut.create({
            id_reservasi,
            userIn : user.username,
            checkin, //: tanggalIn,
            checkout, //: tanggalOut,
            wakeUp, //: wakeup,
            national,
            purpose,
            paymentIn,
            description : description,
            total : idReservasi.total,
            totalRemarks : idReservasi.subTotalRemarks,
            totalRoom: idReservasi.subTotalRoom,
            roomNO : idReservasi.roomNo
        })

        await Room.update({
           statusRoom : 'booked'
        }, {
             where : {roomNo : idReservasi.roomNo}
        })

        await Reservasi.update({
           status : 'in'
        }, {
             where : {id : idReservasi.id}
        })

         res.status(200).json(inCheck);
    } catch (error) {
         res.status(500).json({ message: error.message });
    }
}

const checkOut = async (req, res) => {
    const {paymentOut, other } = req.body;
    const id_user = req.user.id;
    const id = req.params.id;
    try {
        let jumlahOther = 0;

        const form = await CheckinOut.findByPk(id)
        if (!form) {
            return res.status(400).json({ message: 'data not found' });
        }

        const user = await User.findByPk(id_user)
        if (!user) {
            return res.status(400).json({ message: 'user not found' });
        }

        if (!['cash', 'debit'].includes(paymentOut)) {
             return res.status(400).json({ message: 'payment method tidak tersedia' });
        }

        if (other) {
            for (let index = 0; index < other.length; index++) {
                const { detail, price } = other[index];
                await Other.create({
                    id_inOut: form.id,
                    detail,
                    price,
                });
                jumlahOther += price;
            }
        }
        const totalAkhir = parseInt(jumlahOther) + parseInt(form.total);
        await CheckinOut.update({
            paymentOut,
            userOut: user.username,
            totalCharge: jumlahOther,
            total: totalAkhir,
            formStatus : 'checkout'
        }, {
            where : { id : id}
        })

         await Room.update({
           statusRoom : 'available'
        }, {
             where : {roomNo : form.roomNO}
         })
        
        await Reservasi.update({
           status : 'out'
        }, {
             where : {id : form.id_reservasi}
        })
        
        const formUpdate = await CheckinOut.findByPk(id)
        res.status(200).json(formUpdate);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getOneForm = async (req, res) => {
    const id = req.params.id;
    try {
        const form = await Reservasi.findOne({
            where: { id: id }, 
            include: [
                {
                    model: Remarks
                },
                {
                    model: CheckinOut,
                    include : [{model : Other}]
                }
            ]
        })
         res.status(200).json(form);
    } catch (error) {
         res.status(500).json({ message: error.message });
    }
}

const getReservasi = async (req, res) => {
    try {
        const reservasi = await Reservasi.findAll({
            where : {status : 'reservasi'}
        })
        res.status(200).json(reservasi);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getCheckin = async (req, res) => {
    try {
        const checkin = await Reservasi.findAll({
            where: { status: 'in' },
            // attributes : ['name', 'checkin', 'checkout', 'roomNo'],
            include: [{
                model : CheckinOut
            }]
        })
         res.status(200).json(checkin);
    } catch (error) {
         res.status(500).json({ message: error.message });
    }
}

const getCheckout = async (req, res) => {
    try {
        const checkout = await Reservasi.findAll({
            where : {status : 'out'}
        })
         res.status(200).json(checkout);
    } catch (error) {
         res.status(500).json({ message: error.message });
    }
}

const Total = async (req, res) => {
    try {
        const total = await CheckinOut.sum('total', {
             where : { formStatus : 'checkout'}
        })

         const checkout = await Reservasi.findAll({
            where: { status: 'out' },
            include: [
                {
                    model: CheckinOut,
                    attributes: ['total']
                },
            ]
        });

        res.status(200).json({total, checkout});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    checkIn,
    checkOut,
    getOneForm,
    getCheckin,
    getCheckout,
    Total,
    getReservasi
}