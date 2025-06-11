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

const getPengeluaranByRange = async (req, res) => {
    let start, end;

    try {
        if (req.query.hari) {
            const hari = new Date(req.query.hari);
            start = new Date(hari.setHours(0, 0, 0, 0));
            end = new Date(hari.setHours(23, 59, 59, 999));
        } else if (req.query.minggu) {
            const minggu = new Date(req.query.minggu);
            start = new Date(minggu.setHours(0, 0, 0, 0));
            end = new Date(start);
            end.setDate(end.getDate() + 6);
            end.setHours(23, 59, 59, 999);
        } else if (req.query.bulan && req.query.tahun) {
            const bulan = parseInt(req.query.bulan) - 1;
            const tahun = parseInt(req.query.tahun);
            start = new Date(tahun, bulan, 1, 0, 0, 0);
            end = new Date(tahun, bulan + 1, 0, 23, 59, 59);
        } else if (req.query.tahun) {
            const tahun = parseInt(req.query.tahun);
            start = new Date(tahun, 0, 1, 0, 0, 0);
            end = new Date(tahun, 11, 31, 23, 59, 59);
        } else {
            return res.status(400).json({ message: 'Parameter waktu tidak valid.' });
        }

        const data = await Pengeluaran.findAll({
            where: {
                createdAt: {
                    [Op.between]: [start, end]
                }
            }
        });

        const total = data.reduce((sum, item) => sum + item.harga, 0);

        res.status(200).json({
            range: { start, end },
            total,
            data
        });
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data pengeluaran.', error });
    }
};

module.exports = {
    createPengeluaran,
    getPengeluaranByRange
};
