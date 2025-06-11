const { Op, fn, col, literal, Sequelize } = require('sequelize');
const Pengeluaran = require('../../../models/FnB/Pengeluaran/pengeluaran');

// Helper: Format tanggal hari ini dalam YYYY-MM-DD
const today = new Date();
const formatDate = date => date.toISOString().slice(0, 10);

const createPengeluaran = async (req, res) => {
    const user = req.user.id;
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'Data pengeluaran tidak valid.' });
    }

    try {
        const pengeluaranData = items.map(item => {
            if (!item.nama_barang || !item.jumlah || !item.harga) {
                throw new Error('Setiap item harus memiliki nama_barang, jumlah, dan harga.');
            }

            return {
                nama_barang: item.nama_barang,
                jumlah: item.jumlah,
                harga: item.harga
            };
        });

        await Pengeluaran.bulkCreate(pengeluaranData);

        res.status(201).json({
            message: 'Pengeluaran berhasil disimpan.',
            data: pengeluaranData
        });
    } catch (error) {
        res.status(500).json({
            message: 'Terjadi kesalahan saat menyimpan pengeluaran.',
            error
        });
    }
};

const getPengeluaranPerhari = async (req, res) => {
    const user = req.user.id;
    const tanggalHariIni = formatDate(today);

    try {
        const data = await Pengeluaran.findAll({
            where: {
                createdAt: {
                    [Op.gte]: new Date(tanggalHariIni + ' 00:00:00'),
                    [Op.lte]: new Date(tanggalHariIni + ' 23:59:59')
                }
            }
        });

        const total = data.reduce((sum, item) => {
            return sum + (item.harga * parseInt(item.jumlah));
        }, 0);

        res.status(200).json({ tanggal: tanggalHariIni, total, data });
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil pengeluaran per hari.', error });
    }
};

const getPengeluaranPerMinggu = async (req, res) => {
    const today = new Date();
    const mingguAwal = new Date(today.setDate(today.getDate() - today.getDay())); // Minggu
    const mingguAkhir = new Date();
    mingguAkhir.setDate(mingguAwal.getDate() + 6); // Sabtu

    try {
        const data = await Pengeluaran.findAll({
            where: {
                createdAt: {
                    [Op.between]: [mingguAwal, mingguAkhir]
                }
            }
        });

        const total = data.reduce((sum, item) => sum + (item.harga * parseInt(item.jumlah)), 0);

        res.status(200).json({
            minggu: `${formatDate(mingguAwal)} - ${formatDate(mingguAkhir)}`,
            total,
            data
        });
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil pengeluaran per minggu.', error });
    }
};

const getPengeluaranPerBulan = async (req, res) => {
    const today = new Date();
    const bulan = today.getMonth(); // 0-11
    const tahun = today.getFullYear();

    const awalBulan = new Date(tahun, bulan, 1);
    const akhirBulan = new Date(tahun, bulan + 1, 0, 23, 59, 59);

    try {
        const data = await Pengeluaran.findAll({
            where: {
                createdAt: {
                    [Op.between]: [awalBulan, akhirBulan]
                }
            }
        });

        const total = data.reduce((sum, item) => sum + (item.harga * parseInt(item.jumlah)), 0);

        res.status(200).json({
            bulan: `${tahun}-${(bulan + 1).toString().padStart(2, '0')}`,
            total,
            data
        });
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil pengeluaran per bulan.', error });
    }
};

const getPengeluaranPerTahun = async (req, res) => {
    const tahun = new Date().getFullYear();

    const awalTahun = new Date(tahun, 0, 1);
    const akhirTahun = new Date(tahun, 11, 31, 23, 59, 59);

    try {
        const data = await Pengeluaran.findAll({
            where: {
                createdAt: {
                    [Op.between]: [awalTahun, akhirTahun]
                }
            }
        });

        const total = data.reduce((sum, item) => sum + (item.harga * parseInt(item.jumlah)), 0);

        res.status(200).json({
            tahun,
            total,
            data
        });
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil pengeluaran per tahun.', error });
    }
};

module.exports = {
    createPengeluaran,
    getPengeluaranPerhari,
    getPengeluaranPerMinggu,
    getPengeluaranPerBulan,
    getPengeluaranPerTahun
};
