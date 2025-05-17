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
const RoomR = require("../../models/room/room");


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
        roomG,
        preferency,
        children,
        adult,
        // rate,
        total,
        down,
        remaining,
        payment,
        address,
        remarks
    } = req.body;
    try {

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
            // room,
            preferency,
            children,
            adult,
            // rate,
            total,
            down,
            remaining,
            payment,
            address
        });

        if (remarks) {
            for (let index = 0; index < remarks.length; index++) {
                const { detail } = remarks[index];
                await Remarks.create({
                    id_reservasiP: reservasi.id,
                    detail,
                });
            }
        }

        if (roomG && roomG.length > 0) {
            const globalArrival = reservasi.checkin ? new Date(reservasi.checkin) : null;
            const globalDeparture = reservasi?.checkout ? new Date(reservasi.checkout) : null;

            if (!globalArrival || !globalDeparture) {
                throw new Error('Global arrival or departure date is missing');
            }

            for (const roomData of roomG) {
                let arrivalDate = roomData.checkin ? new Date(roomData.checkin) : globalArrival;
                let departureDate = roomData.checkout ? new Date(roomData.checkout) : globalDeparture;

                // Normalisasi tanggal untuk mengabaikan waktu
                arrivalDate.setHours(0, 0, 0, 0);
                departureDate.setHours(0, 0, 0, 0);

                if (!arrivalDate || !departureDate) {
                    throw new Error(`Tanggal kedatangan atau keberangkatan hilang untuk kamar: ${roomData.room}`);
                }

                if (departureDate <= arrivalDate) {
                    throw new Error(`Tanggal keberangkatan harus setelah tanggal kedatangan untuk kamar: ${roomData.room}`);
                }

                const checkForConflicts = async (room, arrivalDate, departureDate) => {
                    const conflictingReservations = await RoomG.findOne({
                        where: {
                            room,
                            status: 'reservasi',
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
                        // transaction,
                    });

                    const conflictingReservations2 = await RoomR.findOne({
                        where: {
                            room,
                            status: 'in',
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
                        // transaction,
                    });

                    if (conflictingReservations || conflictingReservations2) {
                        throw new Error(`Kamar ${room} sudah dipesan atau digunakan pada periode yang diminta.`);
                    }
                };


                await checkForConflicts(roomData.room, arrivalDate, departureDate);

                // Simpan data kamar setelah validasi
                await RoomG.create({
                    id_reservasiP: reservasi.id,
                    room: roomData.room,
                    rate: roomData.rate,
                    stay: reservasi.stay,
                    sub_total: roomData.sub_total,
                    arrival: arrivalDate,
                    departure: departureDate,
                });
            }
        }
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

const editReservasiHotel = async (req, res) => {
    const {
        name,
        email,
        phone,
        checkin,
        checkout,
        stay,
        bookedBy,
        roomG,
        preferency,
        children,
        adult,
        total,
        down,
        remaining,
        payment,
        address,
        remarks
    } = req.body;

    const id = req.params.id;
    const remarkList = Array.isArray(remarks) ? remarks : [];

    try {
        const reservasiId = await Reservasi.findByPk(id);
        if (!reservasiId) {
            return res.status(400).json({ message: 'Reservasi tidak ditemukan' });
        }

        const checkinDate = new Date(checkin);
        const checkoutDate = new Date(checkout);

        if (checkinDate >= checkoutDate) {
            return res.status(400).json({ message: 'Tanggal check-in harus sebelum tanggal check-out.' });
        }

        const hasChanges =
            reservasiId.name !== name ||
            reservasiId.email !== email ||
            reservasiId.phone !== phone ||
            new Date(reservasiId.checkin).toISOString() !== checkinDate.toISOString() ||
            new Date(reservasiId.checkout).toISOString() !== checkoutDate.toISOString() ||
            reservasiId.stay !== stay ||
            reservasiId.bookedBy !== bookedBy ||
            reservasiId.preferency !== preferency ||
            reservasiId.children !== children ||
            reservasiId.adult !== adult ||
            reservasiId.total !== total ||
            reservasiId.down !== down ||
            reservasiId.remaining !== remaining ||
            reservasiId.address !== address ||
            reservasiId.payment !== payment;

        if (!hasChanges && remarkList.length === 0) {
            return res.status(200).json({ message: 'Tidak ada perubahan pada data reservasi' });
        }

        await reservasiId.update({
            name,
            email,
            phone,
            checkin,
            checkout,
            stay,
            bookedBy,
            preferency,
            children,
            adult,
            total,
            down,
            remaining,
            address,
            payment
        });

        await Remarks.destroy({ where: { id_reservasiP: id } });
        if (remarkList.length > 0) {
            for (const { detail } of remarkList) {
                await Remarks.create({ id_reservasiP: id, detail });
            }
        }

        await RoomG.destroy({ where: { id_reservasiP: id } });
        if (roomG && roomG.length > 0) {
            const globalArrival = checkinDate;
            const globalDeparture = checkoutDate;

            for (const roomData of roomG) {
                let arrivalDate = roomData.checkin ? new Date(roomData.checkin) : globalArrival;
                let departureDate = roomData.checkout ? new Date(roomData.checkout) : globalDeparture;

                arrivalDate.setHours(0, 0, 0, 0);
                departureDate.setHours(0, 0, 0, 0);

                if (departureDate <= arrivalDate) {
                    return res.status(400).json({ message: `Tanggal check-out harus setelah check-in untuk kamar ${roomData.room}` });
                }

                const conflict2 = await RoomR.findOne({
                    where: {
                        room: roomData.room,
                        status: 'in',
                        // id_reservasiP: { [Op.ne]: id },
                        [Op.or]: [
                            { arrival: { [Op.between]: [arrivalDate, departureDate] } },
                            { departure: { [Op.between]: [arrivalDate, departureDate] } },
                            {
                                [Op.and]: [
                                    { arrival: { [Op.lte]: arrivalDate } },
                                    { departure: { [Op.gte]: departureDate } }
                                ]
                            }
                        ]
                    }
                });

                if (conflict2) {
                    return res.status(400).json({ message: `Kamar ${roomData.room} sudah dipesan pada periode tersebut.` });
                }
                const conflict = await RoomG.findOne({
                    where: {
                        room: roomData.room,
                        status: 'reservasi',
                        id_reservasiP: { [Op.ne]: id },
                        [Op.or]: [
                            { arrival: { [Op.between]: [arrivalDate, departureDate] } },
                            { departure: { [Op.between]: [arrivalDate, departureDate] } },
                            {
                                [Op.and]: [
                                    { arrival: { [Op.lte]: arrivalDate } },
                                    { departure: { [Op.gte]: departureDate } }
                                ]
                            }
                        ]
                    }
                });

                if (conflict) {
                    return res.status(400).json({ message: `Kamar ${roomData.room} sudah dipesan pada periode tersebut.` });
                }

                await RoomG.create({
                    id_reservasiP: reservasiId.id,
                    room: roomData.room,
                    rate: roomData.rate,
                    stay: stay,
                    sub_total: roomData.sub_total,
                    arrival: arrivalDate,
                    departure: departureDate
                });
            }
        }

        res.status(200).json({ message: 'Reservasi berhasil diperbarui' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const reservasiGroup2 = async (req, res) => {
    const { id } = req.user;
    const {
        phone,
        email,
        name,
        name_of_travel,
        orCompany,
        address,
        contact,
        // deposit,
        clrek,
        dateC,
        followup,
        romming,
        metodeBooking,
        // back_lip,
        rack,
        initialDate,
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
            phone,
            email,
            name_of_travel,
            orCompany,
            address,
            contact,
            // deposit,
            clrek,
            dateC,
            followup,
            romming,
            metodeBooking,
            rack,
            initialDate,
            // back_lip,
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
                            status: 'reservasi',
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

                    const conflictingReservations2 = await RoomR.findOne({
                        where: {
                            room,
                            status: 'in',
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

                    if (conflictingReservations || conflictingReservations2) {
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

const editreservasiGroup = async (req, res) => {
    const { id } = req.params;
    const {
        name,
        name_of_travel,
        orCompany,
        address,
        contact,
        clrek,
        dateC,
        followup,
        romming,
        metodeBooking,
        rack,
        initialDate,
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
        remaining,
        phone,
        email,
    } = req.body;

    const t = await sequelize.transaction();
    console.log(req.body);
    try {
        const reservasi = await ReservasiGroup.findByPk(id);
        if (!reservasi) {
            return res.status(404).json({ message: 'Reservasi tidak ditemukan' });
        }

        // Update data utama
        await reservasi.update({
            name,
            phone,
            email,
            name_of_travel,
            orCompany,
            address,
            contact,
            clrek,
            dateC,
            followup,
            romming,
            metodeBooking,
            rack,
            initialDate,
            charter,
            entered_by,
            total,
            payment,
            adult,
            children,
            down,
            remaining
        }, { transaction: t });

        // Remarks
        await Remarks.destroy({ where: { id_reservasi: id } });
        if (remarks && remarks.length > 0) {
            for (const { detail } of remarks) {
                await Remarks.create({ id_reservasi: id, detail }, { transaction: t });
            }
        }

        // Makanan
        await Makanan.destroy({ where: { id_reservasi_group: id } });
        if (makanan && makanan.length > 0) {
            for (const { meal, tours, account } of makanan) {
                await Makanan.create({
                    id_reservasi_group: id,
                    meal,
                    tours,
                    account
                }, { transaction: t });
            }
        }

        // Arrival
        if (!arrival || arrival.length === 0) {
            throw new Error('Arrival dates are required');
        }
        await ArrivalGroup.destroy({ where: { id_reservasi_group: id } });
        for (const { datee, flight, time } of arrival) {
            await ArrivalGroup.create({
                id_reservasi_group: id,
                datee,
                flight,
                time
            }, { transaction: t });
        }

        // Departure
        if (!departure || departure.length === 0) {
            throw new Error('Departure dates are required');
        }
        await DepartureGroup.destroy({ where: { id_reservasi_group: id } });
        for (const { datee, flight, time } of departure) {
            await DepartureGroup.create({
                id_reservasi_group: id,
                datee,
                flight,
                time
            }, { transaction: t });
        }

        // RoomG
        await RoomG.destroy({ where: { id_reservasi: id } });
        if (roomG && roomG.length > 0) {
            const globalArrival = new Date(arrival[0]?.datee);
            const globalDeparture = new Date(departure[0]?.datee);

            for (const roomData of roomG) {
                let arrivalDate = roomData.arrival ? new Date(roomData.arrival) : globalArrival;
                let departureDate = roomData.departure ? new Date(roomData.departure) : globalDeparture;

                arrivalDate.setHours(0, 0, 0, 0);
                departureDate.setHours(0, 0, 0, 0);

                if (departureDate <= arrivalDate) {
                    throw new Error(`Tanggal keberangkatan harus setelah kedatangan untuk kamar ${roomData.room}`);
                }

                const conflict = await RoomG.findOne({
                    where: {
                        room: roomData.room,
                        status: 'reservasi',
                        id_reservasi: { [Op.ne]: id }, // pengecualian edit reservasi ini sendiri
                        [Op.or]: [
                            { arrival: { [Op.between]: [arrivalDate, departureDate] } },
                            { departure: { [Op.between]: [arrivalDate, departureDate] } },
                            {
                                [Op.and]: [
                                    { arrival: { [Op.lte]: arrivalDate } },
                                    { departure: { [Op.gte]: departureDate } }
                                ]
                            }
                        ]
                    },
                    transaction: t
                });

                if (conflict) {
                    throw new Error(`Kamar ${roomData.room} sudah dipesan pada periode tersebut`);
                }

                const conflict2 = await RoomR.findOne({
                    where: {
                        room: roomData.room,
                        status: 'in',
                        // id_reservasiP: { [Op.ne]: id },
                        [Op.or]: [
                            { arrival: { [Op.between]: [arrivalDate, departureDate] } },
                            { departure: { [Op.between]: [arrivalDate, departureDate] } },
                            {
                                [Op.and]: [
                                    { arrival: { [Op.lte]: arrivalDate } },
                                    { departure: { [Op.gte]: departureDate } }
                                ]
                            }
                        ]
                    },
                    transaction: t
                });

                if (conflict2) {
                    throw new Error(`Kamar ${roomData.room} sudah dipesan pada periode tersebut`);
                }
                await RoomG.create({
                    id_reservasi: id,
                    room: roomData.room,
                    rate: roomData.rate,
                    stay: roomData.stay,
                    sub_total: roomData.sub_total,
                    arrival: arrivalDate,
                    departure: departureDate
                }, { transaction: t });
            }
        }

        await t.commit();
        res.status(200).json({ message: 'Reservasi berhasil diperbarui', reservasi });
    } catch (error) {
        await t.rollback();
        res.status(500).json({ message: error.message });
    }
};


module.exports = {
    reservasiHotel,
    reservasiGroup2,
    editReservasiHotel,
    editreservasiGroup
}