const TransaksiLaundry = require("../../../models/Laundry/Transaksi/transaksiLaundry");
const User = require("../../../models/User/users");
const Bahan = require("../../../models/Laundry/Transaksi/bahan");
const TransaksiLaundryBahan = require("../../../models/Laundry/Transaksi/transaksiLaundryBahan");
const moment = require("moment");

// **Create TransaksiLaundry**
const createTransaksiLaundry = async (req, res) => {
    try {
        const user = req.user; // User yang sedang login
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
            dp,
            dateOut,
            timeOut,
        } = req.body;

        const biayaLayanan = Math.round(harga * 0.21);

        const subTotal = harga + biayaLayanan;

        const sisa = subTotal - dp;

        // Buat transaksi laundry baru
        const newTransaksi = await TransaksiLaundry.create({
            dateIn: moment().format("YYYY-MM-DD"),
            timeIn: moment().format("HH:mm:ss"),
            checkByIn: user.id,
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
            biayaLayanan,
            subTotal,
            dp,
            sisa,
            dateOut,
            timeOut,
            status: "proses",
        });

        let bahanDetails = [];

        if (supplyUsed && Array.isArray(supplyUsed)) {
            for (const item of supplyUsed) {
                const { bahanId } = item;
                const bahan = await Bahan.findByPk(bahanId);

                if (!bahan) {
                    return res.status(404).json({
                        message: `Bahan dengan ID ${bahanId} tidak ditemukan`,
                    });
                }

                if (bahan.stokAkhir <= 0) {
                    return res.status(400).json({
                        message: `Stok bahan ${bahan.namaBahan} habis.`,
                    });
                }

                bahan.stokAkhir -= 1; // Kurangi stokAkhir
                await bahan.save();

                await TransaksiLaundryBahan.create({
                    transaksiLaundryId: newTransaksi.id,
                    bahanId,
                    jumlah: 1,
                });

                bahanDetails.push({
                    bahanId: bahan.id,
                    namaBahan: bahan.namaBahan,
                });
            }
        }

        const checkByInUser = await User.findByPk(user.id);

        res.status(201).json({
            message: "Transaksi laundry berhasil dibuat",
            data: {
                transaksi: {
                    ...newTransaksi.toJSON(),
                    checkByIn: checkByInUser?.username,
                },
                supplyUsed: bahanDetails,
            },
        });
    } catch (error) {
        res.status(500).json({
            message: "Terjadi kesalahan saat membuat transaksi laundry",
            error: error.message,
        });
    }
};

// **Update Status TransaksiLaundry**
const updateTransaksiLaundryStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const user = req.user;

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
            updatedData.checkByOut = user.id;
            updatedData.timeOutAktual = moment().format("HH:mm:ss");
            updatedData.dateOutAktual = moment().format("YYYY-MM-DD");
            updatedData.sisa = 0;
        }

        await laundryTransaction.update(updatedData);

        const checkByInUser = await User.findByPk(laundryTransaction.checkByIn);
        const checkByOutUser = status === "selesai" ? user.username : null;

        res.status(200).json({
            message: "Status transaksi laundry berhasil diperbarui",
            data: {
                ...laundryTransaction.toJSON(),
                checkByIn: checkByInUser?.username || null,
                checkByOut: checkByOutUser,
            },
        });
    } catch (error) {
        res.status(500).json({
            message: "Terjadi kesalahan saat memperbarui status transaksi laundry",
            error: error.message,
        });
    }
};

// **Get All TransaksiLaundry**
const getAllTransaksiLaundry = async (req, res) => {
    try {
        const transaksiLaundry = await TransaksiLaundry.findAll({
            include: [
                { model: User, as: "checkByInUser", attributes: ["username"] },
                { model: User, as: "checkByOutUser", attributes: ["username"] },
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

        if (transaksiLaundry.length === 0) {
            return res.status(404).json({
                message: "Belum ada data transaksi laundry",
            });
        }

        const result = transaksiLaundry.map((transaction) => {
            // Mengonversi data transaksi menjadi JSON
            const transactionData = transaction.toJSON();

            // Tambahkan informasi supplyUsed
            const supplyUsed =
                transactionData.transaksiLaundryBahans?.map((bahanData) => ({
                    bahanId: bahanData.bahan.id,
                    namaBahan: bahanData.bahan.namaBahan,
                })) || [];

            return {
                ...transactionData,
                checkByIn: transaction.checkByInUser?.username || null,
                checkByOut: transaction.checkByOutUser?.username || null,
                supplyUsed, // Tambahkan informasi supplyUsed
            };
        });

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
                message: `Tidak ada transaksi laundry dengan status '${status}`,
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
            message: `Berhasil mengambil data transaksi laundry dengan status ${status}`,
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

// **Get TransaksiLaundry by ID**
const getTransaksiLaundryById = async (req, res) => {
    try {
        const { id } = req.params;

        const transaksiLaundry = await TransaksiLaundry.findByPk(id, {
            include: [
                { model: User, as: "checkByInUser", attributes: ["username"] },
                { model: User, as: "checkByOutUser", attributes: ["username"] },
            ],
        });

        if (!transaksiLaundry) {
            return res.status(404).json({
                message: `Transaksi laundry dengan ID ${id} tidak ditemukan`,
            });
        }

        res.status(200).json({
            message: `Berhasil mengambil data transaksi laundry dengan ID ${id}`,
            data: {
                ...transaksiLaundry.toJSON(),
                checkByIn: transaksiLaundry.checkByInUser?.username || null,
                checkByOut: transaksiLaundry.checkByOutUser?.username || null,
            },
        });
    } catch (error) {
        res.status(500).json({
            message: "Terjadi kesalahan saat mengambil data transaksi laundry",
            error: error.message,
        });
    }
};

// **Delete TransaksiLaundry**
const deleteTransaksiLaundry = async (req, res) => {
    try {
        const { id } = req.params;

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
    getTransaksiLaundryByStatus,
    getAllTransaksiLaundry,
    getTransaksiLaundryById,
    deleteTransaksiLaundry,
};
