const Remarks = require("../../models/room/remarks");
const Reservasi = require("../../models/room/reservasi");
const moment = require("moment");
const Room = require("../../models/room/room");
const User = require("../../models/User/users");
const { Sequelize, Op } = require("sequelize");
const RoomG = require("../../models/room/roomG");
const ReservasiGroup = require("../../models/room/reservasiG");
const Makanan = require("../../models/room/other");
const ArrivalGroup = require("../../models/room/arrival");
const DepartureGroup = require("../../models/room/departure");
const sequelize = require('../../config/database');


const reservasiHotel = async (req, res) => {
    const { id } = req.user;
    const {
        name,
        email,
        phone,
        checkin,
        checkout,
        stay,
        bookedBy,
        room,
        preferency,
        children,
        adult,
        rate,
        total,
        down,
        remaining,
        payment
    } = req.body;
    try {

        const noRoom = await Room.findOne({ where: { gabungan: room } });
        if (!noRoom) {
            return res.status(400).json({ message: 'room not found' });
        }

        // const formattedCheckin = moment(checkin, "DD-MM-YYYY").format("YYYY-MM-DD");
        // const formattedCheckout = moment(checkout, "DD-MM-YYYY").format("YYYY-MM-DD");

        if (new Date(checkin).getTime() === new Date(checkout).getTime()) {
            return res.status(400).json({ message: 'Check-in and check-out dates cannot be the same day' });
        }

        const conflictingReservations = await Reservasi.findAll({
            where: {
                room: noRoom.gabungan,
                [Op.or]: [
                    {
                        // Kondisi 1: Check-in baru berada di dalam rentang reservasi yang ada
                        [Op.and]: [
                            { checkin: { [Op.lte]: checkin } },
                            { checkout: { [Op.gte]: checkin } }
                        ]
                    },
                    {
                        // Kondisi 2: Check-out baru berada di dalam rentang reservasi yang ada
                        [Op.and]: [
                            { checkin: { [Op.lte]: checkout } },
                            { checkout: { [Op.gte]: checkout } }
                        ]
                    },
                    {
                        // Kondisi 3: Periode baru mencakup seluruh rentang reservasi yang ada
                        [Op.and]: [
                            { checkin: { [Op.gte]: checkin } },
                            { checkout: { [Op.lte]: checkout } }
                        ]
                    },
                    {
                        // Kondisi 4: Reservasi yang ada mencakup seluruh periode baru
                        [Op.and]: [
                            { checkin: { [Op.lte]: checkin } },
                            { checkout: { [Op.gte]: checkout } }
                        ]
                    }
                ]
            }
        });

        if (conflictingReservations.length > 0) {
            return res.status(400).json({
                message: `Room is already reserved during the specified time.`,
                conflicts: conflictingReservations
            });
        }


        // const resepsionis = await User.findByPk(id);

        // const tanggalIn = moment(checkin, "HH-MM-TTTT").format('TTTT-MM-HH');
        // const tanggalOut = moment(checkout, "HH-MM-TTTT").format('TTTT-MM-HH');

        const reservasi = await Reservasi.create({
            userId: id,
            name,
            email,
            phone,
            checkin, //: formattedCheckin,
            checkout, //: formattedCheckout,
            stay,
            bookedBy,
            room,
            preferency,
            children,
            adult,
            rate,
            total,
            down,
            remaining,
            payment
        });

        // if (remarks) {
        //     for (let index = 0; index < remarks.length; index++) {
        //         const { detail } = remarks[index];
        //         await Remarks.create({
        //             id_reservasi: reservasi.id,
        //             detail,
        //         });
        //     }
        // }

        // const harga_permalam = noRoom.harga;
        // const jamIn = new Date(checkin);
        // const jamOut = new Date(checkout);
        // const totalMalam = Math.ceil((jamOut - jamIn) / (1000 * 60 * 60 * 24));

        // const totalPermalam = totalMalam * harga_permalam;
        // const jumlahSemua = totalPermalam + jumlahTotal;

        // console.log(jumlahTotal);
        // console.log(totalPermalam);


        // await reservasi.update({
        //     subTotalRemarks: jumlahTotal,
        //     subTotalRoom: totalPermalam,
        //     total: jumlahSemua
        // });

        res.status(200).json(reservasi);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const reservasiGroup2 = async (req, res) => {
    const { id } = req.user;
    const {
        name,
        name_of_travel,
        orCompany,
        address,
        contact,
        deposit,
        clrek,
        dateC,
        followup,
        romming,
        phone,
        letter,
        celex,
        facsimile,
        back_lip,
        charter,
        entered_by,
        makanan,
        roomG,
        remarks,
        departure,
        arrival,
        total,
        children,
        adult,
        payment,
        down,
        remaining
    } = req.body;

    const t = await sequelize.transaction();

    try {
        const reservasi = await ReservasiGroup.create({
            userId: id,
            name,
            name_of_travel,
            orCompany,
            address,
            contact,
            deposit,
            clrek,
            dateC,
            followup,
            romming,
            phone,
            letter,
            celex,
            facsimile,
            back_lip,
            charter,
            entered_by,
            total,
            payment,
            adult,
            children,
            down,
            remaining
        }, { transaction: t });

        // Handle remarks
        if (remarks && remarks.length > 0) {
            for (let index = 0; index < remarks.length; index++) {
                const { detail } = remarks[index];
                await Remarks.create({
                    id_reservasi: reservasi.id,
                    detail
                }, { transaction: t });
            }
        }

        // Handle makanan
        if (makanan && makanan.length > 0) {
            for (let index = 0; index < makanan.length; index++) {
                const { meal, tours, account } = makanan[index];
                await Makanan.create({
                    id_reservasi_group: reservasi.id,
                    meal,
                    tours,
                    account
                }, { transaction: t });
            }
        }

        // Handle arrival
        if (!arrival || arrival.length === 0) {
            throw new Error('Arrival dates are required');
        }
        for (let index = 0; index < arrival.length; index++) {
            const { datee, flight, time } = arrival[index];
            await ArrivalGroup.create({
                id_reservasi_group: reservasi.id,
                datee,
                flight,
                time
            }, { transaction: t });
        }

        // Handle departure
        if (!departure || departure.length === 0) {
            throw new Error('Departure dates are required');
        }
        for (let index = 0; index < departure.length; index++) {
            const { datee, flight, time } = departure[index];
            await DepartureGroup.create({
                id_reservasi_group: reservasi.id,
                datee,
                flight,
                time
            }, { transaction: t });
        }

        // Handle roomG
        if (roomG && roomG.length > 0) {
            const globalArrival = arrival[0]?.datee ? new Date(arrival[0].datee) : null;
            const globalDeparture = departure[0]?.datee ? new Date(departure[0].datee) : null;

            if (!globalArrival || !globalDeparture) {
                throw new Error('Global arrival or departure date is missing');
            }

            for (const roomData of roomG) {
                let arrivalDate = roomData.arrival ? new Date(roomData.arrival) : globalArrival;
                let departureDate = roomData.departure ? new Date(roomData.departure) : globalDeparture;

                // Normalisasi tanggal untuk mengabaikan waktu
                arrivalDate.setHours(0, 0, 0, 0);
                departureDate.setHours(0, 0, 0, 0);

                if (!arrivalDate || !departureDate) {
                    throw new Error(`Tanggal kedatangan atau keberangkatan hilang untuk kamar: ${roomData.room}`);
                }

                if (departureDate <= arrivalDate) {
                    throw new Error(`Tanggal keberangkatan harus setelah tanggal kedatangan untuk kamar: ${roomData.room}`);
                }

                const checkForConflicts = async (room, arrivalDate, departureDate, transaction) => {
                    const conflictingReservations = await RoomG.findOne({
                        where: {
                            room,
                            [Op.or]: [
                                {
                                    arrival: { [Op.between]: [arrivalDate, departureDate] },
                                },
                                {
                                    departure: { [Op.between]: [arrivalDate, departureDate] },
                                },
                                {
                                    [Op.and]: [
                                        { arrival: { [Op.lte]: arrivalDate } },
                                        { departure: { [Op.gte]: departureDate } },
                                    ],
                                },
                            ],
                        },
                        transaction,
                    });

                    if (conflictingReservations) {
                        throw new Error(`Kamar ${room} sudah dipesan pada periode yang diminta.`);
                    }
                };

                await checkForConflicts(roomData.room, arrivalDate, departureDate, t);

                // Simpan data kamar setelah validasi
                await RoomG.create({
                    id_reservasi: reservasi.id,
                    room: roomData.room,
                    rate: roomData.rate,
                    stay: roomData.stay,
                    sub_total: roomData.sub_total,
                    arrival: arrivalDate,
                    departure: departureDate,
                }, { transaction: t });
            }
        }

        await t.commit();
        res.status(201).json({ message: 'Reservasi created successfully', reservasi });
    } catch (error) {
        await t.rollback();
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    reservasiHotel,
    reservasiGroup2
}