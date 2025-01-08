const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");
const sequelize = require("./config/database");
const Routes = require("./routes/routes");
const User = require("./models/User/users");
const Detail_Order = require("./models/FnB/Produk/detailOrder");
const Order = require("./models/FnB/Produk/order");
const TransaksiLaundry = require("./models/Laundry/Transaksi/transaksiLaundry");
const Produk = require("./models/FnB/Produk/produk");
const Bahan = require("./models/Laundry/Transaksi/bahan");
const TransaksiLaundryBahan = require("./models/Laundry/Transaksi/transaksiLaundryBahan");
const Room = require("./models/room/room");
const Reservasi = require("./models/room/reservasi");
const Registrasi = require("./models/room/inOut");
const Remarks = require("./models/room/remarks");
const Makanan = require("./models/room/other");
const RoomG = require("./models/room/roomG");
const ReservasiGroup = require("./models/room/reservasiG");
const DepartureGroup = require("./models/room/departure");
const ArrivalGroup = require("./models/room/arrival");

dotenv.config();
const app = express();

app.use(
    cors({
        credentials: true,
        origin: true
    })
);

app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));

// Middleware untuk melayani file statis di folder uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api", Routes);

sequelize.authenticate().then(async () => {
    console.log("Database berhasil konek");
    // await Registrasi.sync({alter : true});
}).catch(err => console.log(`Error: ${err}`));

app.listen(process.env.PORT, () => {
    console.log(`Server running in port ${process.env.PORT}`);
});
