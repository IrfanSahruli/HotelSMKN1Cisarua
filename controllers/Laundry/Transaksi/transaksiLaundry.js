const TransaksiLaundry = require("../../../models/Laundry/Transaksi/transaksiLaundry");
const User = require("../../../models/User/users");
const Bahan = require("../../../models/Laundry/Transaksi/bahan");
const TransaksiLaundryBahan = require("../../../models/Laundry/Transaksi/transaksiLaundryBahan");
const moment = require("moment");

// Create TransaksiLaundry function
const createTransaksiLaundry = async (req, res) => {
    try {
        // Ambil user yang sedang login dari req.user
        const user = req.user;

        const {
            customer,
            noTelepon,
            itemType,
            pcs,
            color_description,
            brand,
            care_instruction,
            remarks,
            personInCharge,
            supplyUsed,
            service,
            weight,
            harga,
            dateOut,
        } = req.body;

        // Buat transaksi laundry baru
        const newTransaksi = await TransaksiLaundry.create({
            dateIn: new Date(),
            timeIn: new Date().toLocaleTimeString(),
            checkByIn: user.id, // Simpan ID user
            customer,
            noTelepon,
            itemType,
            pcs,
            color_description,
            brand,
            care_instruction,
            remarks,
            personInCharge,
            service,
            weight,
            harga,
            dateOut,
            status: "proses",
        });

        let bahanDetails = [];

        // Simpan data supplyUsed ke tabel pivot TransaksiLaundryBahan
        if (supplyUsed && Array.isArray(supplyUsed)) {
            for (const item of supplyUsed) {
                const { bahanId } = item;

                // Periksa apakah bahan dengan ID yang diberikan ada
                const bahan = await Bahan.findByPk(bahanId);
                if (!bahan) {
                    return res.status(404).json({
                        message: `Bahan dengan ID ${bahanId} tidak ditemukan`,
                    });
                }

                // Kurangi stok bahan
                if (bahan.stok <= 0) {
                    return res.status(400).json({
                        message: `Stok bahan ${bahan.namaBahan} habis.`,
                    });
                }

                bahan.stok -= 1; // Mengurangi stok bahan sebanyak 1
                await bahan.save(); // Simpan perubahan stok ke database

                // Tambahkan data ke tabel pivot
                await TransaksiLaundryBahan.create({
                    transaksiLaundryId: newTransaksi.id,
                    bahanId,
                    jumlah: 1, // Misalkan default jumlah adalah 1
                });

                // Masukkan detail bahan ke dalam array
                bahanDetails.push({
                    bahanId: bahan.id,
                    namaBahan: bahan.namaBahan,
                });
            }
        }

        // Ambil username berdasarkan `checkByIn`
        const checkByInUser = await User.findByPk(user.id);

        // Respons dengan detail transaksi dan bahan yang digunakan
        res.status(201).json({
            message: "Transaksi laundry berhasil dibuat",
            data: {
                transaksi: {
                    ...newTransaksi.toJSON(),
                    checkByIn: checkByInUser?.username, // Ganti ID dengan username di respons
                },
                supplyUsed: bahanDetails,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Terjadi kesalahan pada server",
            error: error.message,
        });
    }
};

// Update function to change status and set checkByOut and timeOut
const updateTransaksiLaundryStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const user = req.user; // User yang sedang login

        const laundryTransaction = await TransaksiLaundry.findByPk(id);

        if (!laundryTransaction) {
            return res.status(404).json({
                message: `Transaksi laundry dengan ID ${id} tidak ditemukan`,
            });
        }

        if (!status) {
            return res.status(400).json({
                message: "Status harus diisi untuk memperbarui transaksi",
            });
        }

        const updatedData = { status };

        if (status === "selesai") {
            updatedData.checkByOut = user.id; // Simpan ID user di database
            updatedData.timeOut = moment().format("HH:mm:ss");
            updatedData.dateOutAktual = new Date(); // Atur dateOutAktual otomatis
        }

        await laundryTransaction.update(updatedData);

        // Ambil username untuk `checkByIn` dan `checkByOut`
        const checkByInUser = await User.findByPk(laundryTransaction.checkByIn);
        const checkByOutUser = status === "selesai" ? user.username : null;

        res.status(200).json({
            message: "Status transaksi laundry berhasil diperbarui",
            data: {
                ...laundryTransaction.toJSON(),
                checkByIn: checkByInUser?.username || null, // Ubah ID menjadi username
                checkByOut: checkByOutUser, // Username user yang melakukan update jika status selesai
            },
        });
    } catch (error) {
        res.status(500).json({
            message: "Terjadi kesalahan saat memperbarui status transaksi laundry",
            error: error.message,
        });
    }
};

const getAllTransaksiLaundry = async (req, res) => {
    try {
        const transaksiLaundry = await TransaksiLaundry.findAll({
            include: [
                { model: User, as: "checkByInUser", attributes: ["username"] },
                { model: User, as: "checkByOutUser", attributes: ["username"] },
                { model: Bahan, attributes: ["namaBahan"] },
            ],
        });

        if (transaksiLaundry.length === 0) {
            return res.status(404).json({
                message: "Belum ada data transaksi laundry yang tercatat",
            });
        }

        const result = transaksiLaundry.map((transaction) => ({
            ...transaction.toJSON(),
            checkByIn: transaction.checkByInUser
                ? transaction.checkByInUser.username
                : null,
            checkByOut: transaction.checkByOutUser
                ? transaction.checkByOutUser.username
                : null,
        }));

        res.status(200).json({
            message: "Berhasil mengambil semua data transaksi laundry",
            data: result,
        });
    } catch (error) {
        res.status(500).json({
            message: "Terjadi kesalahan saat mengambil data transaksi laundry",
            error: error.message,
        });
    }
};

const getTransaksiLaundryByStatus = async (req, res) => {
    try {
        const { status } = req.params;

        if (!status) {
            return res.status(400).json({
                message: "Status harus diisi untuk mengambil data transaksi",
            });
        }

        const transaksiLaundry = await TransaksiLaundry.findAll({
            where: { status },
            include: [
                {
                    model: User,
                    as: "checkByInUser",
                    attributes: ["username"],
                },
                {
                    model: User,
                    as: "checkByOutUser",
                    attributes: ["username"],
                },
                {
                    model: TransaksiLaundryBahan,
                    as: 'transaksiLaundryBahans',
                    include: [
                        {
                            model: Bahan,
                            attributes: ["id", "namaBahan"],
                        },
                    ],
                },
            ],
        });

        if (transaksiLaundry.length === 0) {
            return res.status(404).json({
                message: `Tidak ada transaksi laundry dengan status '${status}'`,
            });
        }

        const result = transaksiLaundry.map((transaction) => {
            // Hapus transaksiLaundryBahans dari objek transaksi
            const transactionData = transaction.toJSON();
            delete transactionData.transaksiLaundryBahans;

            return {
                ...transactionData,
                checkByIn: transaction.checkByInUser?.username || null,
                checkByOut: transaction.checkByOutUser?.username || null,
                supplyUsed: transaction.transaksiLaundryBahans?.map((bahanData) => ({
                    bahanId: bahanData.bahan.id,
                    namaBahan: bahanData.bahan.namaBahan,
                })) || [],
            };
        });

        res.status(200).json({
            message: `Berhasil mengambil data transaksi laundry dengan status '${status}'`,
            data: result,
        });
    } catch (error) {
        console.error(error); // Tambahkan log untuk debug
        res.status(500).json({
            message: "Terjadi kesalahan saat mengambil data transaksi laundry",
            error: error.message,
        });
    }
};

const getTransaksiLaundryById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                message: "ID harus diisi untuk mengambil data transaksi",
            });
        }

        const transaksiLaundry = await TransaksiLaundry.findByPk(id, {
            include: [
                {
                    model: User,
                    as: "checkByInUser",
                    attributes: ["username"],
                },
                {
                    model: User,
                    as: "checkByOutUser",
                    attributes: ["username"],
                },
                {
                    model: TransaksiLaundryBahan,
                    as: "transaksiLaundryBahans",
                    include: [
                        {
                            model: Bahan,
                            attributes: ["id", "namaBahan"],
                        },
                    ],
                },
            ],
        });

        if (!transaksiLaundry) {
            return res.status(404).json({
                message: `Transaksi laundry dengan ID ${id} tidak ditemukan`,
            });
        }

        const result = {
            ...transaksiLaundry.toJSON(),
            checkByIn: transaksiLaundry.checkByInUser
                ? transaksiLaundry.checkByInUser.username
                : null,
            checkByOut: transaksiLaundry.checkByOutUser
                ? transaksiLaundry.checkByOutUser.username
                : null,
            supplyUsed: transaksiLaundry.transaksiLaundryBahans?.map((bahanData) => ({
                bahanId: bahanData.bahan.id,
                namaBahan: bahanData.bahan.namaBahan,
            })) || [],
        };

        // Hapus transaksiLaundryBahans dari objek result
        delete result.transaksiLaundryBahans;

        res.status(200).json({
            message: `Berhasil mengambil data transaksi laundry dengan ID ${id}`,
            data: result,
        });
    } catch (error) {
        res.status(500).json({
            message: "Terjadi kesalahan saat mengambil data transaksi laundry",
            error: error.message,
        });
    }
};

const deleteTransaksiLaundry = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                message: "ID harus diisi untuk menghapus transaksi laundry",
            });
        }

        const laundryTransaction = await TransaksiLaundry.findByPk(id);

        if (!laundryTransaction) {
            return res.status(404).json({
                message: `Transaksi laundry dengan ID ${id} tidak ditemukan`,
            });
        }

        await laundryTransaction.destroy();

        res.status(200).json({
            message: `Berhasil menghapus transaksi laundry dengan ID ${id}`,
        });
    } catch (error) {
        res.status(500).json({
            message: "Terjadi kesalahan saat menghapus transaksi laundry",
            error: error.message,
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
