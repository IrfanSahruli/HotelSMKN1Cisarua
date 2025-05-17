const { Op } = require("sequelize");
const sequelize = require("../../config/database");
const ArrivalGroup = require("../../models/room/arrival");
const DepartureGroup = require("../../models/room/departure");
const CheckinOut = require("../../models/room/inOut");
const Makanan = require("../../models/room/other");
// const Other = require("../../models/room/other");
const RegistrasiGroup = require("../../models/room/registrasiGLangsung");
const RegistrasiLangsung = require("../../models/room/registrasiLangsung");
const Remarks = require("../../models/room/remarks");
const RemarksR = require("../../models/room/remarksR");
const Reservasi = require("../../models/room/reservasi");
const ReservasiGroup = require("../../models/room/reservasiG");
const RoomR = require("../../models/room/room");
// const Room = require("../../models/room/room");
const RoomG = require("../../models/room/roomG");
const User = require("../../models/User/users");
const moment = require("moment");
const MakananR = require("../../models/room/makananR");
const Bill = require("../../models/room/bill");

// const sequelize = require('../config/sequelize'); // <-- ini tambah di atas!

const RegistrasiPersonal = async (req, res) => {
    const {
        id_reservasi, fullname, title, address, postal, id_number, itype,
        email, phone, deposit, total, paymentmethod, cardNo, cvv, exp,
        front_desk, remarksR, nationality, birth, loyalNumber, loyalLevel,
        remaining, adult, children, stay, checkin, checkout, roomR
    } = req.body;
    const id = req.user.id;

    const t = await sequelize.transaction(); // pastikan sequelize sudah di-import

    try {
        console.log('Data yang diterima:', req.body);

        const user = await User.findByPk(id, { transaction: t });
        if (!user) {
            await t.rollback();
            return res.status(400).json({ message: 'User not found' });
        }

        if (!id_reservasi) {
            await t.rollback();
            return res.status(400).json({ message: 'id_reservasi must be provided' });
        }

        const idReservasi = await Reservasi.findByPk(id_reservasi, { transaction: t });
        if (!idReservasi) {
            await t.rollback();
            return res.status(400).json({ message: 'Reservasi data not found' });
        }

        if (idReservasi.status === 'in') {
            await t.rollback();
            return res.status(400).json({ message: 'Reservasi status is already "in".' });
        }

        // const formatExp = exp ? moment(exp, "DD-MM-YYYY").format("YYYY-MM-DD") : null;

        const inCheck = await RegistrasiLangsung.create({
            userIn: user.username,
            id_reservasi, fullname, title, address, postal, id_number, itype,
            email, phone, deposit, total, paymentmethod, cardNo, cvv, exp,
            front_desk, nationality, birth, loyalNumber, loyalLevel,
            remaining, adult, children, stay, checkin, checkout
        }, { transaction: t });

        if (remarksR) {
            for (const { detail } of remarksR) {
                await RemarksR.create({
                    id_registrasiP: inCheck.id,
                    detail,
                }, { transaction: t });
            }
        }

        if (roomR && roomR.length > 0) {
            const globalArrival = checkin ? new Date(checkin) : null;
            const globalDeparture = checkout ? new Date(checkout) : null;

            for (const roomData of roomR) {
                let arrivalDate = roomData.checkin ? new Date(roomData.checkin) : globalArrival;
                let departureDate = roomData.checkout ? new Date(roomData.checkout) : globalDeparture;

                arrivalDate.setHours(0, 0, 0, 0);
                departureDate.setHours(0, 0, 0, 0);

                if (!arrivalDate || !departureDate || departureDate <= arrivalDate) {
                    return res.status(400).json({ message: `Tanggal invalid untuk kamar ${roomData.room}` });
                }

                const isConflict = await Promise.any([
                    RoomR.findOne({
                        where: {
                            room: roomData.room,
                            status: 'in',
                            [Op.or]: [
                                { arrival: { [Op.between]: [arrivalDate, departureDate] } },
                                { departure: { [Op.between]: [arrivalDate, departureDate] } },
                                {
                                    [Op.and]: [
                                        { arrival: { [Op.lte]: arrivalDate } },
                                        { departure: { [Op.gte]: departureDate } },
                                    ],
                                },
                            ],
                        },
                    }),
                    RoomG.findOne({
                        where: {
                            id_reservasiP: { [Op.ne]: idReservasi },
                            room: roomData.room,
                            status: 'reservasi',
                            [Op.or]: [
                                { arrival: { [Op.between]: [arrivalDate, departureDate] } },
                                { departure: { [Op.between]: [arrivalDate, departureDate] } },
                                {
                                    [Op.and]: [
                                        { arrival: { [Op.lte]: arrivalDate } },
                                        { departure: { [Op.gte]: departureDate } },
                                    ],
                                },
                            ],
                        },
                    }),
                ]).catch(() => null);

                if (isConflict) {
                    return res.status(400).json({ message: `Kamar ${roomData.room} sudah dipesan pada periode tersebut.` });
                }
            }
        }

        if (roomR && roomR.length > 0) {
            const globalArrival = checkin ? new Date(checkin) : null;
            const globalDeparture = checkout ? new Date(checkout) : null;

            for (const roomData of roomR) {
                let arrivalDate = roomData.checkin ? new Date(roomData.checkin) : globalArrival;
                let departureDate = roomData.checkout ? new Date(roomData.checkout) : globalDeparture;

                arrivalDate.setHours(0, 0, 0, 0);
                departureDate.setHours(0, 0, 0, 0);

                await RoomR.create({
                    id_registrasiP: inCheck.id,
                    room: roomData.room,
                    rate: roomData.rate,
                    stay: stay,
                    sub_total: roomData.sub_total,
                    arrival: arrivalDate,
                    departure: departureDate,
                }, { transaction: t });
            }
        }
        await RoomG.update({
            status: 'in',
        }, {
            where: { id_reservasiP: id_reservasi },
            transaction: t
        });

        await Reservasi.update({
            status: 'in',
            // adult, children, stay, checkin, checkout
        }, {
            where: { id: id_reservasi },
            transaction: t
        });

        await t.commit();
        res.status(200).json(inCheck);
    } catch (error) {
        if (t) await t.rollback();
        res.status(500).json({ message: error.message });
    }
};

const RegistrasiPersonalLangsung = async (req, res) => {
    const {
        fullname, title, address, postal, id_number, itype,
        email, phone, deposit, total, paymentmethod, cardNo,
        cvv, exp, front_desk, remarksR, formStatusGP, nationality,
        birth, loyalNumber, loyalLevel, remaining, adult, children,
        stay, checkin, checkout, roomR
    } = req.body;
    const id = req.user.id;

    try {
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // const formatExp = moment(exp, "DD-MM-YYYY").format("YYYY-MM-DD");

        // Cek konflik kamar sebelum transaksi dimulai
        if (roomR && roomR.length > 0) {
            const globalArrival = checkin ? new Date(checkin) : null;
            const globalDeparture = checkout ? new Date(checkout) : null;

            for (const roomData of roomR) {
                let arrivalDate = roomData.checkin ? new Date(roomData.checkin) : globalArrival;
                let departureDate = roomData.checkout ? new Date(roomData.checkout) : globalDeparture;

                arrivalDate.setHours(0, 0, 0, 0);
                departureDate.setHours(0, 0, 0, 0);

                if (!arrivalDate || !departureDate || departureDate <= arrivalDate) {
                    return res.status(400).json({ message: `Tanggal invalid untuk kamar ${roomData.room}` });
                }

                const isConflict = await Promise.any([
                    RoomR.findOne({
                        where: {
                            room: roomData.room,
                            status: 'in',
                            [Op.or]: [
                                { arrival: { [Op.between]: [arrivalDate, departureDate] } },
                                { departure: { [Op.between]: [arrivalDate, departureDate] } },
                                {
                                    [Op.and]: [
                                        { arrival: { [Op.lte]: arrivalDate } },
                                        { departure: { [Op.gte]: departureDate } },
                                    ],
                                },
                            ],
                        },
                    }),
                    RoomG.findOne({
                        where: {
                            room: roomData.room,
                            status: 'reservasi',
                            [Op.or]: [
                                { arrival: { [Op.between]: [arrivalDate, departureDate] } },
                                { departure: { [Op.between]: [arrivalDate, departureDate] } },
                                {
                                    [Op.and]: [
                                        { arrival: { [Op.lte]: arrivalDate } },
                                        { departure: { [Op.gte]: departureDate } },
                                    ],
                                },
                            ],
                        },
                    }),
                ]).catch(() => null); // catch jika keduanya null

                if (isConflict) {
                    return res.status(400).json({ message: `Kamar ${roomData.room} sudah dipesan pada periode tersebut.` });
                }
            }
        }

        // Mulai transaksi setelah semua pengecekan aman
        const t = await sequelize.transaction();
        try {
            const inCheck = await RegistrasiLangsung.create({
                userIn: user.username,
                fullname, title, address, postal, id_number, itype,
                email, phone, deposit, total, paymentmethod, cardNo,
                cvv, exp, front_desk, formStatusGP, nationality,
                birth, loyalNumber, loyalLevel, remaining, adult, children,
                stay, checkin, checkout
            }, { transaction: t });

            if (remarksR) {
                for (const { detail } of remarksR) {
                    await RemarksR.create({
                        id_registrasiP: inCheck.id,
                        detail,
                    }, { transaction: t });
                }
            }

            console.log(roomR);

            if (roomR && roomR.length > 0) {
                const globalArrival = checkin ? new Date(checkin) : null;
                const globalDeparture = checkout ? new Date(checkout) : null;

                for (const roomData of roomR) {
                    let arrivalDate = roomData.checkin ? new Date(roomData.checkin) : globalArrival;
                    let departureDate = roomData.checkout ? new Date(roomData.checkout) : globalDeparture;

                    arrivalDate.setHours(0, 0, 0, 0);
                    departureDate.setHours(0, 0, 0, 0);

                    await RoomR.create({
                        id_registrasiP: inCheck.id,
                        room: roomData.room,
                        rate: roomData.rate,
                        stay: stay,
                        sub_total: roomData.sub_total,
                        arrival: arrivalDate,
                        departure: departureDate,
                    }, { transaction: t });
                }
            }

            await t.commit();
            res.status(200).json(inCheck);
        } catch (err) {
            await t.rollback();
            res.status(500).json({ message: err.message });
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const editRegistrasiPersonal = async (req, res) => {
    const { id } = req.params;
    const {
        fullname, title, address, postal, id_number, itype,
        email, phone, deposit, total, paymentmethod, cardNo,
        cvv, exp, front_desk, remarksR, formStatusGP, nationality,
        birth, loyalNumber, loyalLevel, remaining, adult, children,
        stay, checkin, checkout, roomR
    } = req.body;
    const idUser = req.user.id;

    try {
        console.log('Data yang akan diupdate:', {
            fullname, title, address, postal, id_number, itype,
            email, phone, deposit, total, paymentmethod, cardNo,
            cvv, exp, front_desk, formStatusGP, nationality,
            birth, loyalNumber, loyalLevel, remaining, adult, children,
            stay, checkin, checkout
        });
        const user = await User.findByPk(idUser);
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        const registrasi = await RegistrasiLangsung.findByPk(id);
        if (!registrasi) {
            return res.status(400).json({ message: 'Registrasi not found' });
        }

        // const formatExp = moment(exp, "DD-MM-YYYY").format("YYYY-MM-DD");

        if (roomR && roomR.length > 0) {
            const globalArrival = checkin ? new Date(checkin) : null;
            const globalDeparture = checkout ? new Date(checkout) : null;

            for (const roomData of roomR) {
                let arrivalDate = roomData.checkin ? new Date(roomData.checkin) : globalArrival;
                let departureDate = roomData.checkout ? new Date(roomData.checkout) : globalDeparture;

                arrivalDate.setHours(0, 0, 0, 0);
                departureDate.setHours(0, 0, 0, 0);

                if (!arrivalDate || !departureDate || departureDate <= arrivalDate) {
                    return res.status(400).json({ message: `Tanggal invalid untuk kamar ${roomData.room}` });
                }

                const isConflict = await Promise.any([
                    RoomR.findOne({
                        where: {
                            room: roomData.room,
                            status: 'in',
                            id_registrasiP: { [Op.ne]: registrasi.id },
                            [Op.or]: [
                                { arrival: { [Op.between]: [arrivalDate, departureDate] } },
                                { departure: { [Op.between]: [arrivalDate, departureDate] } },
                                {
                                    [Op.and]: [
                                        { arrival: { [Op.lte]: arrivalDate } },
                                        { departure: { [Op.gte]: departureDate } },
                                    ],
                                },
                            ],
                        },
                    }),
                    RoomG.findOne({
                        where: {
                            room: roomData.room,
                            status: 'reservasi',
                            [Op.or]: [
                                { arrival: { [Op.between]: [arrivalDate, departureDate] } },
                                { departure: { [Op.between]: [arrivalDate, departureDate] } },
                                {
                                    [Op.and]: [
                                        { arrival: { [Op.lte]: arrivalDate } },
                                        { departure: { [Op.gte]: departureDate } },
                                    ],
                                },
                            ],
                        },
                    }),
                ]).catch(() => null);

                if (isConflict) {
                    return res.status(400).json({ message: `Kamar ${roomData.room} sudah dipesan pada periode tersebut.` });
                }
            }
        }

        const t = await sequelize.transaction();
        try {
            await RegistrasiLangsung.update({
                userIn: user.username,
                fullname, title, address, postal, id_number, itype,
                email, phone, deposit, total, paymentmethod, cardNo,
                cvv, exp, front_desk, formStatusGP, nationality,
                birth, loyalNumber, loyalLevel, remaining, adult, children,
                stay, checkin, checkout
            }, {
                where: { id: registrasi.id },
                transaction: t
            });

            await RemarksR.destroy({ where: { id_registrasiP: id }, transaction: t });
            await RoomR.destroy({ where: { id_registrasiP: id }, transaction: t });

            if (remarksR && remarksR.length > 0) {
                for (const { detail } of remarksR) {
                    await RemarksR.create({
                        id_registrasiP: registrasi.id,
                        detail,
                    }, { transaction: t });
                }
            }

            if (roomR && roomR.length > 0) {
                const globalArrival = checkin ? new Date(checkin) : null;
                const globalDeparture = checkout ? new Date(checkout) : null;

                for (const roomData of roomR) {
                    let arrivalDate = roomData.checkin ? new Date(roomData.checkin) : globalArrival;
                    let departureDate = roomData.checkout ? new Date(roomData.checkout) : globalDeparture;

                    arrivalDate.setHours(0, 0, 0, 0);
                    departureDate.setHours(0, 0, 0, 0);

                    await RoomR.create({
                        id_registrasiP: registrasi.id,
                        room: roomData.room,
                        rate: roomData.rate,
                        stay: stay,
                        sub_total: roomData.sub_total,
                        arrival: arrivalDate,
                        departure: departureDate,
                    }, { transaction: t });
                }
            }

            await t.commit();
            res.status(200).json({ message: "Data registrasi berhasil diperbarui." });
        } catch (err) {
            await t.rollback();
            res.status(500).json({ message: err.message });
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const registrasiGroup = async (req, res) => {
    const { id } = req.user;
    const {
        id_reservasi_group,
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
        front_desk,
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
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        const reservasiG = await ReservasiGroup.findByPk(id);
        if (!reservasiG) {
            return res.status(400).json({ message: 'Reservasi not found' });
        }
        const reservasi = await RegistrasiGroup.create({
            // userId: id,
            phone,
            email,
            userIn: user.username,
            id_reservasi_group,
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
            rack,
            initialDate,
            // back_lip,
            charter,
            front_desk,
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
                await RemarksR.create({
                    id_registrasi: reservasi.id,
                    detail
                }, { transaction: t });
            }
        }

        // Handle makanan
        if (makanan && makanan.length > 0) {
            for (let index = 0; index < makanan.length; index++) {
                const { meal, tours, account } = makanan[index];
                await MakananR.create({
                    id_registrasi: reservasi.id,
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
                id_registrasi: reservasi.id,
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
                id_registrasi: reservasi.id,
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

                const checkForConflicts = async (room, arrivalDate, departureDate) => {
                    const conflictingReservations = await RoomR.findOne({
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

                    const conflictingReservations2 = await RoomG.findOne({
                        where: {
                            id_reservasi: { [Op.ne]: reservasiG.id },
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

                    if (conflictingReservations || conflictingReservations2) {
                        throw new Error(`Kamar ${room} sudah dipesan pada periode yang diminta.`);
                    }
                };

                await checkForConflicts(roomData.room, arrivalDate, departureDate, t);

                // Simpan data kamar setelah validasi
                await RoomR.create({
                    id_registrasi: reservasi.id,
                    room: roomData.room,
                    rate: roomData.rate,
                    stay: roomData.stay,
                    sub_total: roomData.sub_total,
                    arrival: arrivalDate,
                    departure: departureDate,
                }, { transaction: t });
            }
        }

        await RoomG.update({
            status: 'in',
        }, {
            where: { id_reservasi: reservasiG.id },
            transaction: t
        });

        await ReservasiGroup.update({
            status: 'in',
            // adult, children, stay, checkin, checkout
        }, {
            where: { id: reservasiG.id },
            transaction: t
        });
        await t.commit();
        res.status(201).json({ message: 'Reservasi created successfully', reservasi });
    } catch (error) {
        await t.rollback();
        res.status(500).json({ message: error.message });
    }
};

const registrasiGroupLangsung = async (req, res) => {
    const { id } = req.user;
    const {
        // id_reservasi_group,
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
        front_desk,
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
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }
        const reservasi = await RegistrasiGroup.create({
            // userId: id,
            userIn: user.username,
            // id_reservasi_group,
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
            rack,
            initialDate,
            // back_lip,
            charter,
            front_desk,
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
                await RemarksR.create({
                    id_registrasi: reservasi.id,
                    detail
                }, { transaction: t });
            }
        }

        // Handle makanan
        if (makanan && makanan.length > 0) {
            for (let index = 0; index < makanan.length; index++) {
                const { meal, tours, account } = makanan[index];
                await MakananR.create({
                    id_registrasi: reservasi.id,
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
                id_registrasi: reservasi.id,
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
                id_registrasi: reservasi.id,
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
                    const conflictingReservations = await RoomR.findOne({
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

                    const conflictingReservations2 = await RoomG.findOne({
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

                    if (conflictingReservations || conflictingReservations2) {
                        throw new Error(`Kamar ${room} sudah dipesan pada periode yang diminta.`);
                    }
                };

                await checkForConflicts(roomData.room, arrivalDate, departureDate, t);

                // Simpan data kamar setelah validasi
                await RoomR.create({
                    id_registrasi: reservasi.id,
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

const editRegistrasiGroup = async (req, res) => {
    const idUser = req.user.id;
    const { id } = req.params;
    const {
        name, name_of_travel, orCompany, address, contact, phone,
        email,
        clrek, dateC, followup, romming, metodeBooking, rack, initialDate,
        charter, front_desk, makanan, roomG, remarks, departure, arrival,
        total, children, adult, payment, down, remaining
    } = req.body;

    const t = await sequelize.transaction();

    try {
        console.log({
            name, name_of_travel, orCompany, address, contact, phone,
            email,
            clrek, dateC, followup, romming, metodeBooking, rack, initialDate,
            charter, front_desk, makanan, roomG, remarks, departure, arrival,
            total, children, adult, payment, down, remaining
        });

        const user = await User.findByPk(idUser);
        if (!user) return res.status(400).json({ message: 'User not found' });

        const registrasi = await RegistrasiGroup.findByPk(id);
        if (!registrasi) return res.status(400).json({ message: 'Registrasi Group not found' });

        await RegistrasiGroup.update({
            userIn: user.username,
            name, name_of_travel, orCompany, address, contact,
            clrek, dateC, followup, romming, metodeBooking, rack, initialDate,
            charter, front_desk, total, payment, adult, children, down, remaining, phone,
            email,
        }, { where: { id: registrasi.id }, transaction: t });

        await RemarksR.destroy({ where: { id_registrasi: id }, transaction: t });
        await MakananR.destroy({ where: { id_registrasi: id }, transaction: t });
        await ArrivalGroup.destroy({ where: { id_registrasi: id }, transaction: t });
        await DepartureGroup.destroy({ where: { id_registrasi: id }, transaction: t });
        await RoomR.destroy({ where: { id_registrasi: id }, transaction: t });

        if (remarks && remarks.length > 0) {
            for (const { detail } of remarks) {
                await RemarksR.create({ id_registrasi: id, detail }, { transaction: t });
            }
        }

        if (makanan && makanan.length > 0) {
            for (const { meal, tours, account } of makanan) {
                await MakananR.create({ id_registrasi: id, meal, tours, account }, { transaction: t });
            }
        }

        if (!arrival || arrival.length === 0) throw new Error('Arrival required');
        for (const { datee, flight, time } of arrival) {
            await ArrivalGroup.create({ id_registrasi: id, datee, flight, time }, { transaction: t });
        }

        if (!departure || departure.length === 0) throw new Error('Departure required');
        for (const { datee, flight, time } of departure) {
            await DepartureGroup.create({ id_registrasi: id, datee, flight, time }, { transaction: t });
        }

        if (roomG && roomG.length > 0) {
            const globalArrival = arrival[0]?.datee ? new Date(arrival[0].datee) : null;
            const globalDeparture = departure[0]?.datee ? new Date(departure[0].datee) : null;

            if (!globalArrival || !globalDeparture) throw new Error('Missing global arrival or departure');

            for (const roomData of roomG) {
                const arrivalDate = roomData.arrival ? new Date(roomData.arrival) : globalArrival;
                const departureDate = roomData.departure ? new Date(roomData.departure) : globalDeparture;

                arrivalDate.setHours(0, 0, 0, 0);
                departureDate.setHours(0, 0, 0, 0);

                if (departureDate <= arrivalDate)
                    throw new Error(`Tanggal keluar harus > masuk untuk kamar: ${roomData.room}`);

                const conflict = await RoomR.findOne({
                    where: {
                        id_registrasi: { [Op.ne]: id },
                        room: roomData.room,
                        status: 'in',
                        [Op.or]: [
                            { arrival: { [Op.between]: [arrivalDate, departureDate] } },
                            { departure: { [Op.between]: [arrivalDate, departureDate] } },
                            { [Op.and]: [{ arrival: { [Op.lte]: arrivalDate } }, { departure: { [Op.gte]: departureDate } }] },
                        ],
                    },
                });

                const conflict2 = await RoomG.findOne({
                    where: {
                        room: roomData.room,
                        status: 'reservasi',
                        [Op.or]: [
                            { arrival: { [Op.between]: [arrivalDate, departureDate] } },
                            { departure: { [Op.between]: [arrivalDate, departureDate] } },
                            { [Op.and]: [{ arrival: { [Op.lte]: arrivalDate } }, { departure: { [Op.gte]: departureDate } }] },
                        ],
                    },
                });

                if (conflict || conflict2)
                    throw new Error(`Kamar ${roomData.room} sudah dipesan pada periode yang diminta.`);

                await RoomR.create({
                    id_registrasi: id,
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
        res.status(200).json({ message: 'Reservasi berhasil diperbarui' });
    } catch (error) {
        await t.rollback();
        res.status(500).json({ message: error.message });
    }
};

const getOneForm = async (req, res) => {
    const id = req.params.id;
    try {
        const form = await Reservasi.findOne({
            where: { id: id },
            include: [{
                model: Remarks, as: 'reservasiP'
            }, {
                model: RoomG
            }]
        })
        res.status(200).json(form);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getReservasi = async (req, res) => {
    try {
        const reservasi = await Reservasi.findAll({
            where: { status: 'reservasi' },
            order: [['createdAt', 'DESC']],
            include: [{
                model: RoomG
            }, {
                model: Remarks, as: 'reservasiP'
            }]
        })
        res.status(200).json(reservasi);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getReservasiRegistrasi = async (req, res) => {
    try {
        const reservasi = await RegistrasiLangsung.findAll({
            where: { status: 'in' },
            include: [{
                model: Reservasi,
                include: [{
                    model: Remarks, as: 'id_registrasiP'
                }, {
                    model: RoomG
                }]
            },
            {
                model: RemarksR, as: 'regisP'
            }, {
                model: RoomR
            }],
            order: [['createdAt', 'DESC']],
        })
        res.status(200).json(reservasi);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getRegistrasi = async (req, res) => {
    try {
        const reservasi = await RegistrasiLangsung.findAll({
            // where: { status: 'in' },
            include: [{
                model: Reservasi,
                include: [{
                    model: Remarks, as: 'reservasiP'
                }, {
                    model: RoomG
                }]
            },
            {
                model: RemarksR, as: 'regisP'
            }, {
                model: RoomR
            }],
            order: [['createdAt', 'DESC']],
        })
        res.status(200).json(reservasi);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// const getOneFormRegis = async (req, res) => {
//     const id = req.params.id;
//     try {
//         const form = await RegistrasiPersonal.findOne({
//             where: { id: id }, 
//         })
//          res.status(200).json(form);
//     } catch (error) {
//          res.status(500).json({ message: error.message });
//     }
// }

// const getRegistrasi = async (req, res) => {
//     try {
//         const reservasi = await Re.findAll({
//             where : {status : 'reservasi'}
//         })
//         res.status(200).json(reservasi);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// }

const getCheckin = async (req, res) => {
    try {
        const checkin = await Reservasi.findAll({
            where: { status: 'in' },
            // attributes : ['name', 'checkin', 'checkout', 'roomNo'],
            include: [{
                model: RegistrasiLangsung
            }, {
                model: RegistrasiGroup
            }]
        })
        res.status(200).json(checkin);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getCheckout = async (req, res) => {
    try {
        const checkoutPersonal = await RegistrasiLangsung.findAll({
            where: { status: 'out' },
            include: [
                {
                    model: RemarksR, as: 'regisP'
                },
                // {
                //     model: ArrivalGroup, as: 'arrivalRegistrasi'
                // },
                // {
                //     model: DepartureGroup, as: 'departureRegistrasi'
                // },
                // {
                //     model: MakananR
                // },
                {
                    model: RoomR
                },
                {
                    model: Bill
                },
            ]
        })

        // const checkoutGroup = await RegistrasiGroup.findAll({
        //     where: { status: 'out' }
        // })
        res.status(200).json(checkoutPersonal);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const Total = async (req, res) => {
    try {
        const totalP = await RegistrasiLangsung.sum('total', {
            where: { status: 'out' }
        })

        const totalPriceP = await Bill.sum('price', {
            where: {
                id_registrasi: {
                    [Op.not]: null
                }
            }
        });


        const totalG = await RegistrasiGroup.sum('total', {
            where: { status: 'out' }
        })

        const totalPriceG = await Bill.sum('price', {
            where: {
                id_registrasi_group: {
                    [Op.not]: null
                }
            }
        });

        console.log(totalG);
        console.log(totalP);
        console.log(totalPriceG);
        console.log(totalPriceP);

        const totalPersonal = totalP + totalPriceP;
        const totalGroup = totalG + totalPriceG;
        const totalAll = totalPersonal + totalGroup;
        res.status(200).json({ totalAll, totalPersonal, totalGroup });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const TotalGroup = async (req, res) => {
    try {
        const total = await CheckinOut.sum('total', {
            where: { formStatus: 'checkout', formStatusGP: 'Group' }
        })

        const checkout = await ReservasiGroup.findAll({
            where: { status: 'out' },
            include: [
                {
                    model: RegistrasiGroup,
                    attributes: ['total']
                },
                {
                    model: ArrivalGroup,
                    attributes: ['datee']
                },
                {
                    model: DepartureGroup,
                    attributes: ['datee']
                }
            ]
        });

        res.status(200).json({ total, checkout });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const hapusRservasi = async (req, res) => {
    const { id } = req.params;
    try {
        const reservasi = await Reservasi.findByPk(id)
        if (!reservasi) {
            return res.status(404).json({ message: "Reservasi is not found" });
        }
        await Reservasi.destroy({ where: { id: id } })
        await Remarks.destroy({ where: { id_reservasiP: reservasi.id } })
        await RoomG.destroy({ where: { id_reservasiP: reservasi.id } })
        res.status(200).json({ message: 'sukses' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const hapusRservasiGroup = async (req, res) => {
    const { id } = req.params;
    try {
        const reservasi = await ReservasiGroup.findByPk(id)
        if (!reservasi) {
            return res.status(404).json({ message: "Reservasi Group is not found" });
        }
        await ReservasiGroup.destroy({ where: { id: reservasi.id } })
        await Remarks.destroy({ where: { id_reservasi: reservasi.id } })
        await RoomG.destroy({ where: { id_reservasi: reservasi.id } })
        await Makanan.destroy({ where: { id_reservasi_group: reservasi.id } })
        await ArrivalGroup.destroy({ where: { id_reservasi_group: reservasi.id } })
        await DepartureGroup.destroy({ where: { id_reservasi_group: reservasi.id } })
        res.status(200).json({ message: 'sukses' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const readyToCheckout = async (req, res) => {
    const { id } = req.params;
    const userid = req.user.id;
    try {

        const idUser = await User.findByPk(userid)
        if (!idUser) {
            return res.status(404).json({ message: "user is not found" });
        }

        const registrasi = await RegistrasiLangsung.findByPk(id)
        if (!registrasi) {
            return res.status(404).json({ message: "Registrasi is not found" });
        }

        await RegistrasiLangsung.update({ status: 'out', userOut: idUser.username }, { where: { id: id } })
        if (registrasi.id_reservasi !== null) {
            await Reservasi.update({ status: 'out' }, { where: { id: registrasi.id_reservasi } })
            await RoomG.update({
                status: 'out'
            }, {
                where: { id_reservasiP: registrasi.id_reservasi }
            })
        }

        await RoomR.update({
            status: 'out'
        }, {
            where: { id_registrasiP: registrasi.id }
        })
        res.status(200).json({ message: 'sukses' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const readyToCheckoutGroup = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const t = await sequelize.transaction();
    try {
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const registrasi = await RegistrasiGroup.findByPk(id, { transaction: t });
        if (!registrasi) {
            await t.rollback();
            return res.status(404).json({ message: "Registrasi not found" });
        }

        // Update RegistrasiGroup
        await RegistrasiGroup.update(
            { status: 'out', userOut: user.username },
            { where: { id }, transaction: t }
        );

        // Jika ada relasi ke ReservasiGroup, update juga
        if (registrasi.id_reservasi_group) {
            await ReservasiGroup.update(
                { status: 'out' },
                { where: { id: registrasi.id_reservasi_group }, transaction: t }
            );
            await RoomG.update({
                status: 'out'
            }, {
                where: { id_reservasi: registrasi.id_reservasi_group }
            })
        }

        await RoomR.update({
            status: 'out'
        }, {
            where: { id_registrasi: registrasi.id }
        })
        await t.commit();
        res.status(200).json({ message: 'Checkout berhasil', id });
    } catch (error) {
        await t.rollback();
        res.status(500).json({ message: error.message });
    }
};


const getReservasiGroup = async (req, res) => {
    try {
        const reservasi = await RegistrasiGroup.findAll({
            where: { status: 'in' },
            order: [["createdAt", "DESC"]],
            include: [
                {
                    model: RemarksR, as: 'regis'
                },
                {
                    model: ArrivalGroup, as: 'arrivalRegistrasi'
                },
                {
                    model: DepartureGroup, as: 'departureRegistrasi'
                },
                {
                    model: MakananR
                },
                {
                    model: RoomR
                },
                {
                    model: ReservasiGroup,
                    include: [
                        {
                            model: Remarks, as: 'reservasi'
                        },
                        {
                            model: ArrivalGroup, as: 'arrivalReservasi'
                        },
                        {
                            model: DepartureGroup, as: 'departureReservasi'
                        },
                        {
                            model: Makanan
                        },
                        {
                            model: RoomG
                        },
                    ]
                }
            ]
        })
        res.status(200).json(reservasi)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const getRegistrasiGroup = async (req, res) => {
    try {
        const reservasi = await RegistrasiGroup.findAll({
            // where: { status: 'in' },
            order: [["createdAt", "DESC"]],
            include: [
                {
                    model: RemarksR, as: 'regis'
                },
                {
                    model: ArrivalGroup, as: 'arrivalRegistrasi'
                },
                {
                    model: DepartureGroup, as: 'departureRegistrasi'
                },
                {
                    model: MakananR
                },
                {
                    model: RoomR
                },
                {
                    model: ReservasiGroup,
                    include: [
                        {
                            model: Remarks, as: 'reservasi'
                        },
                        {
                            model: ArrivalGroup, as: 'arrivalReservasi'
                        },
                        {
                            model: DepartureGroup, as: 'departureReservasi'
                        },
                        {
                            model: Makanan
                        },
                        {
                            model: RoomG
                        },
                    ]
                }
            ]
        })
        res.status(200).json(reservasi)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const getReservasiGroupR = async (req, res) => {
    try {
        const reservasi = await ReservasiGroup.findAll({
            where: { status: 'reservasi' },
            order: [["createdAt", "DESC"]],
            include: [
                {
                    model: Remarks, as: 'reservasi'
                },
                {
                    model: ArrivalGroup, as: 'arrivalReservasi'
                },
                {
                    model: DepartureGroup, as: 'departureReservasi'
                },
                {
                    model: Makanan
                },
                {
                    model: RoomG
                },
            ]
        })
        res.status(200).json(reservasi)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const getReservasiGroupIn = async (req, res) => {
    try {
        const reservasi = await ReservasiGroup.findAll({
            where: { status: 'in' },
            order: ['createdAt', 'DESC'],
            include: [
                {
                    model: Remarks
                },
                {
                    model: ArrivalGroup, as: 'arrivalReservasi'
                },
                {
                    model: DepartureGroup, as: 'departureReservasi'
                },
                {
                    model: Makanan
                },
                {
                    model: RoomG
                },
                {
                    model: CheckinOut
                }
            ],

        })
        res.status(200).json(reservasi)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const getReservasiGroupOut = async (req, res) => {
    try {
        const reservasi = await RegistrasiGroup.findAll({
            where: { status: 'out' },
            order: [["createdAt", "DESC"]],
            include: [
                {
                    model: RemarksR, as: 'regis'
                },
                {
                    model: ArrivalGroup, as: 'arrivalRegistrasi'
                },
                {
                    model: DepartureGroup, as: 'departureRegistrasi'
                },
                {
                    model: MakananR
                },
                {
                    model: RoomR
                }
            ]
        })
        res.status(200).json(reservasi)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const hapusReservasiGroup = async (req, res) => {
    const { id } = req.params;
    try {
        const reservasi = await ReservasiGroup.findByPk(id)
        if (!reservasi) {
            return res.status(404).json({ message: "Reservasi is not found" });
        }
        await ReservasiGroup.destroy({ where: { id: id } })
        await Remarks.destroy({ where: { id_reservasi: id } })
        await ArrivalGroup.destroy({ where: { id_reservasi_group: id } })
        await DepartureGroup.destroy({ where: { id_reservasi_group: id } })
        await Makanan.destroy({ where: { id_reservasi_group: id } })
        await RoomG.destroy({ where: { id_reservasi: id } })

        res.status(200).json({ message: 'sukses' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const getOneFormGroup = async (req, res) => {
    const id = req.params.id;
    try {
        const form = await ReservasiGroup.findOne({
            where: { id: id },
            include: [
                {
                    model: Remarks, as: 'reservasi'
                },
                {
                    model: ArrivalGroup, as: "arrivalReservasi"
                },
                {
                    model: DepartureGroup, as: "departureReservasi"
                },
                {
                    model: Makanan
                },
                {
                    model: RoomG
                }
            ]
        })
        res.status(200).json(form);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getOneRegistrasiGroup = async (req, res) => {
    const id = req.params.id;
    try {
        const form = await RegistrasiGroup.findOne({
            where: { id: id },
            include: [
                {
                    model: RemarksR, as: "regis"
                },
                {
                    model: ArrivalGroup, as: "arrivalRegistrasi"
                },
                {
                    model: DepartureGroup, as: "departureRegistrasi"
                },
                {
                    model: MakananR
                },
                {
                    model: RoomR
                },
                {
                    model: Bill
                },
            ]
        })
        res.status(200).json(form);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getOneRegistrasiPersonal = async (req, res) => {
    const id = req.params.id;
    try {
        const form = await RegistrasiLangsung.findOne({
            where: { id: id },
            include: [
                {
                    model: RemarksR, as: "regisP"
                },
                {
                    model: RoomR
                },
                {
                    model: Bill
                },
            ]
        })
        res.status(200).json(form);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const CreateBill = async (req, res) => {
    const { bill, id_registrasi, id_registrasi_group } = req.body
    try {
        if (id_registrasi) {
            const personal = await RegistrasiLangsung.findByPk(id_registrasi)
            if (!personal) {
                return res.status(404).json({ message: 'Registrasi not found' })
            }

            if (bill && bill.length > 0) {
                for (let index = 0; index < bill.length; index++) {
                    const { price, detail } = bill[index];
                    await Bill.create({
                        id_registrasi: personal.id,
                        price,
                        detail,
                    });
                }
            }

            await RegistrasiLangsung.update({
                statusBill: 'selesai',
            }, {
                where: { id: personal.id }
            })
        }

        if (id_registrasi_group) {
            const group = await RegistrasiGroup.findByPk(id_registrasi_group)
            if (!group) {
                return res.status(404).json({ message: 'Registrasi not found' })
            }

            if (bill && bill.length > 0) {
                for (let index = 0; index < bill.length; index++) {
                    const { price, detail } = bill[index];
                    await Bill.create({
                        id_registrasi_group: group.id,
                        price,
                        detail,
                    });
                }

                await RegistrasiGroup.update({
                    statusBill: 'selesai',
                }, {
                    where: { id: group.id }
                })
            }

            return res.status(200).json({ message: 'success' })
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const editBill = async (req, res) => {
    const { bill, id_registrasi, id_registrasi_group } = req.body
    try {
        if (id_registrasi) {
            const personal = await RegistrasiLangsung.findByPk(id_registrasi)
            if (!personal) {
                return res.status(404).json({ message: 'Registrasi not found' })
            }

            await Bill.destroy({ where: { id_registrasi: personal.id } });
            if (bill && bill.length > 0) {
                for (let index = 0; index < bill.length; index++) {
                    const { price, detail } = bill[index];
                    await Bill.create({
                        id_registrasi: personal.id,
                        price,
                        detail,
                    });
                }
            }

            await RegistrasiLangsung.update({
                statusBill: 'selesai',
            }, {
                where: { id: personal.id }
            })
        }

        if (id_registrasi_group) {
            const group = await RegistrasiGroup.findByPk(id_registrasi_group)
            if (!group) {
                return res.status(404).json({ message: 'Registrasi not found' })
            }

            await Bill.destroy({ where: { id_registrasi_group: group.id } });
            if (bill && bill.length > 0) {
                for (let index = 0; index < bill.length; index++) {
                    const { price, detail } = bill[index];
                    await Bill.create({
                        id_registrasi_group: group.id,
                        price,
                        detail,
                    });
                }

                await RegistrasiGroup.update({
                    statusBill: 'selesai',
                }, {
                    where: { id: group.id }
                })
            }

            return res.status(200).json({ message: 'success' })
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
module.exports = {
    RegistrasiPersonal,
    getOneForm,
    getCheckin,
    getCheckout,
    Total,
    getReservasi,
    getReservasiRegistrasi,
    hapusRservasi,
    readyToCheckout,
    getReservasiGroup,
    hapusReservasiGroup,
    getOneFormGroup,
    readyToCheckout,
    readyToCheckoutGroup,
    getReservasiGroupOut,
    TotalGroup,
    getReservasiGroupIn,
    RegistrasiPersonalLangsung,
    registrasiGroup,
    registrasiGroupLangsung,
    getReservasiGroupR,
    getRegistrasi,
    getRegistrasiGroup,
    editRegistrasiGroup,
    editRegistrasiPersonal,
    getOneRegistrasiGroup,
    getOneRegistrasiPersonal,
    CreateBill,
    editBill,
    hapusRservasiGroup
}