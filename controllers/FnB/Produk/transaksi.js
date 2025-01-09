const Detail_Order = require("../../../models/FnB/Produk/detailOrder");
const Order = require("../../../models/FnB/Produk/order");

const Produk = require("../../../models/FnB/Produk/produk");
const User = require("../../../models/User/users");

const createTransaksi = async (req, res) => {
    const { atasNama, produk } = req.body;
    const userId = req.user.id;

    try {
        let totalBiaya = 0;
        let totalppn = 0;
        let totalLayanan = 0;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const order = await Order.create({
            userId,
            kasirName: user.username,
            atasNama,
            total: 0,
            biayaLayanan: 0,
            subTotal: 0,
            ppn: 0,
        });

        if (produk) {
            for (let index = 0; index < produk.length; index++) {
                const item = produk[index];
                const produks = await Produk.findByPk(item.id_produk);

                if (!produks) {
                    return res.status(404).json({ message: `Produk dengan ID ${item.id_produk} tidak ditemukan` });
                }

                if (produks.stok == 0) {
                    return res.status(401).json({ message: 'Stok produk habis' });
                }

                const hargaTotal = produks.hargaJual * item.jumlah;
                const bayarPpn = hargaTotal * 10 / 100;
                const bayarLayanan = hargaTotal * 11 / 100;

                totalBiaya += hargaTotal;
                totalppn += bayarPpn;
                totalLayanan += bayarLayanan;
                const totalSemua = hargaTotal + bayarPpn + bayarLayanan;
                await Detail_Order.create({
                    order_id: order.id,
                    id_produk: item.id_produk,
                    jumlah: item.jumlah,
                    total: hargaTotal,
                    nama: order.atasNama,
                    tambahan: item.tambahan,
                    namaKasir: order.kasirName,
                    layanan: bayarLayanan,
                    ppn: bayarPpn,
                    subTotal : totalSemua
                });

                await Produk.update(
                    {
                        stok: produks.stok - item.jumlah,
                    },
                    {
                        where: { id: item.id_produk },
                    }
                );
            }
        }

        const totalSemua = totalBiaya + totalLayanan + totalppn;

        await order.update({
            total: totalBiaya,
            biayaLayanan: totalLayanan,
            ppn: totalppn,
            subTotal: totalSemua,
        });

        const orderUpdate = await Order.findByPk(order.id);

        return res.status(200).json(orderUpdate);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


const getTransaksiOrder = async (req, res) => {
    try {
        const order = await Detail_Order.findAll();
        return res.status(200).json(order);
    } catch (error) {
         return res.status(500).json({ message: error.message });
    }
}

const deleteRiwayat = async (req, res) => {
    const id = req.params.id;
    try {
         await Detail_Order.destroy({ where : {id : id} }) //truncate menghapus tanpa kondisi, cascade agar tabel berelasi tidak terganggu
        res.status(200).json({ message: 'sukses' })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const totalPemasukkan = async (req, res) => {
    try {
        const pemasukkan = await Order.sum('subTotal');
        const biayaLayanan = await Order.sum('biayaLayanan');
        const totalSebelum = await Order.sum('total');

        res.status(200).json({pemasukkan,biayaLayanan, totalSebelum})
    } catch (error) {
         res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = {
    createTransaksi,
    getTransaksiOrder,
    deleteRiwayat,
    totalPemasukkan
}