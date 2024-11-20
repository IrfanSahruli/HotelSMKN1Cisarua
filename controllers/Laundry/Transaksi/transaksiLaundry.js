const TransaksiLaundry = require("../../../models/Laundry/Transaksi/transaksiLaundry");
const User = require("../../../models/User/users");
const moment = require("moment");

// Create TransaksiLaundry function
const createTransaksiLaundry = async (req, res) => {
    try {
        const user = req.user; // Data pengguna yang login harus berisi id dan username

        // Periksa apakah user ada di tabel User
        const existingUser = await User.findByPk(user.id);
        if (!existingUser) {
            return res.status(404).json({ message: "User tidak ditemukan" });
        }

        // Buat transaksi laundry baru
        const newLaundryTransaction = await TransaksiLaundry.create({
            dateIn: new Date(), // Tanggal masuk otomatis
            timeIn: moment().format("HH:mm:ss"), // Waktu masuk otomatis
            customer: req.body.customer,
            noTelepon: req.body.noTelepon,
            checkByIn: user.id, // Simpan ID user
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
            status: "proses",
        });

        res.status(201).json({
            message: "Transaksi laundry berhasil dibuat",
            data: {
                ...newLaundryTransaction.toJSON(),
                checkByIn: user.username, // Tambahkan username ke respon
            },
        });
    } catch (error) {
        res.status(500).json({
            message: "Gagal membuat transaksi laundry",
            error: error.message,
        });
    }
};

// Update function to change status and set checkByOut and timeOut
const updateTransaksiLaundryStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user; // Data pengguna yang login

        const laundryTransaction = await TransaksiLaundry.findByPk(id);

        if (!laundryTransaction) {
            return res.status(404).json({
                message: "Transaksi laundry tidak ditemukan"
            });
        }

        const updatedData = { ...req.body };

        // Perbarui status dan waktu keluar jika status menjadi 'selesai'
        if (req.body.status === "selesai") {
            updatedData.checkByOut = user.id; // Pengguna yang login
            updatedData.timeOut = moment().format("HH:mm:ss"); // Waktu keluar saat ini
            updatedData.dateOut = new Date(); // Tanggal keluar otomatis
        }

        // Perbarui transaksi laundry
        await laundryTransaction.update(updatedData);

        res.status(200).json({
            message: "Transaksi laundry berhasil diperbarui",
            data: laundryTransaction
        });
    } catch (error) {
        res.status(500).json({
            message: "Gagal memperbarui transaksi laundry",
            error: error.message
        });
    }
};

const getAllTransaksiLaundry = async (req, res) => {
    try {
        // Ambil semua transaksi laundry dengan relasi User
        const transaksiLaundry = await TransaksiLaundry.findAll({
            include: [
                {
                    model: User,
                    as: 'checkByInUser', // Alias untuk checkByIn
                    attributes: ['username'], // Ambil username saja
                },
                {
                    model: User,
                    as: 'checkByOutUser', // Alias untuk checkByOut
                    attributes: ['username'], // Ambil username saja
                }
            ]
        });

        // Map data untuk menyertakan username checkByIn dan checkByOut
        const result = transaksiLaundry.map(transaction => ({
            ...transaction.toJSON(),
            checkByIn: transaction.checkByInUser ? transaction.checkByInUser.username : null,
            checkByOut: transaction.checkByOutUser ? transaction.checkByOutUser.username : null,
        }));

        res.status(200).json({
            message: "Berhasil mengambil semua data transaksi laundry",
            data: result
        });
    } catch (error) {
        res.status(500).json({
            message: "Gagal mengambil semua data transaksi laundry",
            error: error.message
        });
    }
};

const getTransaksiLaundryByStatus = async (req, res) => {
    const { status } = req.params; // Ambil status dari parameter URL

    try {
        // Ambil semua transaksi laundry dengan status tertentu
        const transaksiLaundry = await TransaksiLaundry.findAll({
            where: { status }, // Filter berdasarkan status
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
        const result = transaksiLaundry.map(transaction => ({
            ...transaction.toJSON(),
            checkByIn: transaction.checkByInUser ? transaction.checkByInUser.username : null,
            checkByOut: transaction.checkByOutUser ? transaction.checkByOutUser.username : null
        }));

        // Jika tidak ada data dengan status tertentu
        if (result.length === 0) {
            return res.status(404).json({
                message: `Tidak ada transaksi laundry dengan status '${status}'`
            });
        }

        res.status(200).json({
            message: `Sukses mengambil data transaksi laundry dengan status '${status}'`,
            data: result
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: `Gagal mengambil data transaksi laundry dengan status '${status}'`,
            error: error.message
        });
    }
};

const getTransaksiLaundryById = async (req, res) => {
    try {
        const { id } = req.params; // Ambil ID dari parameter URL

        // Cari transaksi laundry berdasarkan ID
        const transaksiLaundry = await TransaksiLaundry.findByPk(id, {
            include: [
                {
                    model: User,
                    as: "checkByInUser", // Alias untuk checkByIn
                    attributes: ["username"], // Ambil username pengguna yang checkByIn
                },
                {
                    model: User,
                    as: "checkByOutUser", // Alias untuk checkByOut
                    attributes: ["username"], // Ambil username pengguna yang checkByOut
                },
            ],
        });

        // Jika transaksi laundry tidak ditemukan
        if (!transaksiLaundry) {
            return res.status(404).json({
                message: `Transaksi laundry dengan ID ${id} tidak ditemukan`,
            });
        }

        // Sertakan username checkByIn dan checkByOut dalam hasil
        const result = {
            ...transaksiLaundry.toJSON(),
            checkByIn: transaksiLaundry.checkByInUser
                ? transaksiLaundry.checkByInUser.username
                : null,
            checkByOut: transaksiLaundry.checkByOutUser
                ? transaksiLaundry.checkByOutUser.username
                : null,
        };

        res.status(200).json({
            message: `Berhasil mengambil data transaksi laundry dengan ID ${id}`,
            data: result,
        });
    } catch (error) {
        res.status(500).json({
            message: `Gagal mengambil data transaksi laundry dengan ID ${id}`,
            error: error.message,
        });
    }
};

const deleteTransaksiLaundry = async (req, res) => {
    try {
        const { id } = req.params; // Ambil id dari parameter URL

        // Cari transaksi laundry berdasarkan ID
        const laundryTransaction = await TransaksiLaundry.findByPk(id);

        // Jika transaksi tidak ditemukan
        if (!laundryTransaction) {
            return res.status(404).json({
                message: `Transaksi laundry dengan id ${id} tidak ditemukan`
            });
        }

        // Hapus transaksi laundry
        await laundryTransaction.destroy();

        res.status(200).json({
            message: `Berhasil menghapus transaksi laundry dengan id ${id}`
        });
    } catch (error) {
        res.status(500).json({
            message: `Gagal menghapus transaksi laundry dengan id ${id}`,
            error: error.message
        });
    }
};

module.exports = {
    createTransaksiLaundry,
    updateTransaksiLaundryStatus,
    getAllTransaksiLaundry,
    getTransaksiLaundryByStatus,
    getTransaksiLaundryById,
    deleteTransaksiLaundry
};
