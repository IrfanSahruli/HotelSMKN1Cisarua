const TransaksiLaundry = require("../../../models/Laundry/Transaksi/transaksiLaundry");
const User = require("../../../models/User/users");
const moment = require("moment");

// Create TransaksiLaundry function
const createTransaksiLaundry = async (req, res) => {
    try {
        const user = req.user; // Memastikan req.user terisi dengan data pengguna yang sudah login

        // Cek apakah user yang terkait ada di tabel User
        const existingUser = await User.findByPk(user.id);
        if (!existingUser) {
            return res.status(404).json({ message: "User tidak ditemukan" });
        }

        const newLaundryTransaction = await TransaksiLaundry.create({
            date: moment().format("YYYY-MM-DD"), // Tanggal hari ini
            timeIn: moment().format("HH:mm:ss"), // Waktu saat ini
            customer: req.body.customer,
            checkByIn: user.id, // Gunakan user.id yang valid
            itemType: req.body.itemType,
            pcs: req.body.pcs,
            color_description: req.body.color_description,
            brand: req.body.brand,
            care_instruction: req.body.care_instruction,
            remarks: req.body.remarks,
            personInCharge: req.body.personInCharge,
            supplyUsed: req.body.supplyUsed,
            weight: req.body.weight,
            harga: req.body.harga,
            status: "proses"
        });

        res.status(201).json({
            message: "Transaksi laundry created successfully",
            data: newLaundryTransaction
        });
    } catch (error) {
        res.status(500).json({
            message: "Error creating transaksi laundry",
            error: error.message
        });
    }
};

// Update function to change status and set checkByOut and timeOut
const updateTransaksiLaundryStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user; // Logged-in user who is updating the transaction

        const laundryTransaction = await TransaksiLaundry.findByPk(id);

        if (!laundryTransaction) {
            return res.status(404).json({
                message: "Transaksi laundry not found"
            });
        }

        const updatedData = { ...req.body };

        if (req.body.status === "diambil") {
            updatedData.checkByOut = user.id; // Set the logged-in user's ID as checkByOut
            updatedData.timeOut = moment().format("HH:mm:ss"); // Set the current time as timeOut
        }

        // Update the status and any other provided fields
        await laundryTransaction.update(updatedData);

        res.status(200).json({
            message: "Transaksi laundry updated successfully",
            data: laundryTransaction
        });
    } catch (error) {
        res.status(500).json({
            message: "Error updating transaksi laundry",
            error: error.message
        });
    }
};

const getInProcessTransaksiLaundry = async (req, res) => {
    try {
        // Ambil semua transaksi laundry dengan status 'selesai'
        const inProcessTransaksi = await TransaksiLaundry.findAll({
            where: { status: "proses" }, // Hanya transaksi dengan status selesai
            include: [
                {
                    model: User,
                    as: 'checkByInUser', // Alias untuk checkByIn
                    attributes: ['username'], // Hanya ambil username
                },
                {
                    model: User,
                    as: 'checkByOutUser', // Alias untuk checkByOut
                    attributes: ['username'], // Hanya ambil username
                }
            ]
        });

        // Map transaksi untuk menyertakan username checkByIn dan checkByOut
        const result = inProcessTransaksi.map(transaction => {
            return {
                ...transaction.toJSON(),
                checkByIn: transaction.checkByInUser ? transaction.checkByInUser.username : null,
                checkByOut: transaction.checkByOutUser ? transaction.checkByOutUser.username : null
            };
        });

        res.status(200).json({
            message: "Sukses mengambil data transaksi laundry selesai",
            data: result
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Gagal mengambil data transaksi laundry selesai",
            error: error.message
        });
    }
};

const getCompletedTransaksiLaundry = async (req, res) => {
    try {
        // Ambil semua transaksi laundry dengan status 'selesai'
        const completedTransaksi = await TransaksiLaundry.findAll({
            where: { status: "selesai" }, // Hanya transaksi dengan status selesai
            include: [
                {
                    model: User,
                    as: 'checkByInUser', // Alias untuk checkByIn
                    attributes: ['username'], // Hanya ambil username
                },
                {
                    model: User,
                    as: 'checkByOutUser', // Alias untuk checkByOut
                    attributes: ['username'], // Hanya ambil username
                }
            ]
        });

        // Map transaksi untuk menyertakan username checkByIn dan checkByOut
        const result = completedTransaksi.map(transaction => {
            return {
                ...transaction.toJSON(),
                checkByIn: transaction.checkByInUser ? transaction.checkByInUser.username : null,
                checkByOut: transaction.checkByOutUser ? transaction.checkByOutUser.username : null
            };
        });

        res.status(200).json({
            message: "Sukses mengambil data transaksi laundry selesai",
            data: result
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Gagal mengambil data transaksi laundry selesai",
            error: error.message
        });
    }
};

module.exports = {
    createTransaksiLaundry,
    updateTransaksiLaundryStatus,
    getInProcessTransaksiLaundry,
    getCompletedTransaksiLaundry
};