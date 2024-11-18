const express = require("express");
const {
    Register,
    Login,
    LogOut,
    getAllUsers,
    getUsersByRole,
    updateUserById,
    deleteUser
} = require("../../controllers/User/users");
const protect = require("../../middlewares/auth");
const protectApp = require("../../middlewares/authapp");

const router = express.Router();

router.post("/register", protect(["admin"]), Register); //register akun kasir dll di website
router.post("/register", protectApp(["admin"]), Register); //register akun kasir dll di aplikasi
router.post("/registerusers", Register); //register akun users biasa
router.post("/login", Login);
router.get("/users", getAllUsers); //get users
router.get("/users/:role", protect(["admin"]), getUsersByRole); //get akun berdasarkan role
router.put("/users/:id", protect(["admin"]), updateUserById); //update akun berdasarkan role & id
router.delete("/users/:id", protect(["admin"]), deleteUser); //delete users (termasuk kasir)
router.delete("/logout", LogOut);

module.exports = router;
