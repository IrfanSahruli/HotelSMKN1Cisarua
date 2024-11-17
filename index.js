const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const sequelize = require("./config/database");
const Routes = require("./routes/routes");
const User = require("./models/User/users");
const CheckinOut = require("./models/room/inOut");
const Reservasi = require("./models/room/reservasi");
const Other = require("./models/room/other");
const Remarks = require("./models/room/remarks");
const Room = require("./models/room/room");

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

app.use("/api", Routes);

sequelize.authenticate().then(async () => {
    console.log("Database berhasil konek");
    // await sequelize.sync({alter : true});
}).catch(err => console.log(`Error: ${err}`));

app.listen(process.env.PORT, () => {
    console.log(`Server running in port ${process.env.PORT}`);
});
