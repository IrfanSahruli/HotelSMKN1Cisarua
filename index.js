const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const sequelize = require("./config/database");
const Routes = require("./routes/routes");
const User = require("./models/User/users");

dotenv.config();
const app = express();

app.use(
    cors({
        credentials: true,
        origin: true
    })
);

app.use(express.json());

app.use("/api", Routes);

sequelize.authenticate().then(async () => {
    console.log("Database berhasil konek");
    // await User.sync({ alter: true });
}).catch(err => console.log(`Error: ${err}`));

app.listen(process.env.PORT, () => {
    console.log(`Server running in port ${process.env.PORT}`);
});
