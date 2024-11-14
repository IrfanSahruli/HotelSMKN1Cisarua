const express = require("express");
const {
    Register,
    Login,
    LogOut
} = require("../../controllers/User/users");
const protect = require("../../middlewares/auth");

const router = express.Router();

router.post("/register", protect["super admin"], Register);
router.post("/login", Login);
router.delete("/logout", LogOut);

module.exports = router;
