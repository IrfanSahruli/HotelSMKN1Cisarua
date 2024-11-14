const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();
const app = express();

app.use(
    cors({
        credentials: true,
        origin: true
    })
);

app.use(express.json());

app.listen(process.env.PORT, () => {
    console.log(`Server running in port ${process.env.PORT}`);
});
