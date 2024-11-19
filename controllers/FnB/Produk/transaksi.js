const Detail_Order = require("../../../models/FnB/Produk/detailOrder");
const Order = require("../../../models/FnB/Produk/order");
const Produk = require("../../../models/FnB/Produk/produk");
const User = require("../../../models/User/users");

const createTransaksi = async (req, res) => {
    const { atasNama, produk } = req.body;
    const userId = req.user.id;

    try {
        let totalBiaya = 0;
        const biayaLayanan = 3000;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

       
        const order = await Order.create({
            userId,
            kasirName: user.username,
            atasNama,
            total: 0, 
            biayaLayanan,
            subTotal: 0, 
        });

        
        if (produk) {
            for (let index = 0; index < produk.length; index++) {
                const item = produk[index];
                const produks = await Produk.findByPk(item.id_produk);

                if (!produks) {
                    return res.status(404).json({ message: `Produk dengan ID ${item.id_produk} tidak ditemukan` });
                }

                const hargaTotal = produks.harga * item.jumlah;

                await Detail_Order.create({
                    order_id: order.id,
                    id_produk: item.id_produk,
                    jumlah: item.jumlah,
                    subTotal: hargaTotal,
                });

                totalBiaya += hargaTotal;
            }
        }

        
        const totalSemua = totalBiaya + biayaLayanan;

        
        await order.update({
            total: totalBiaya,
            biayaLayanan,
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
        const order = await Order.findAll({
        include: [
            {
                model: Detail_Order,
                include: [
                    {
                        model: Produk
                    }
                ]
            }
        ]
    });
        return res.status(200).json(order);
    } catch (error) {
         return res.status(500).json({ message: error.message });
    }
}
module.exports = {
    createTransaksi,
    getTransaksiOrder
}