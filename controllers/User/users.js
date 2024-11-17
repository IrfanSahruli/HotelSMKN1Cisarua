const User = require("./../../models/User/users");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const Register = async (req, res) => {
    const { username, password, email, no_hp, role } = req.body;

    try {
        const existingUsername = await User.findOne({ where: { username } });
        if (existingUsername) {
            return res.status(409).json({ message: "Username sudah digunakan" });
        }

        const existingEmail = await User.findOne({ where: { email } });
        if (existingEmail) {
            return res.status(409).json({ message: "email sudah digunakan" });
        }

        const existingNo_hp = await User.findOne({ where: { no_hp } });
        if (existingNo_hp) {
            return res.status(409).json({ message: "no_hp sudah digunakan" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            username,
            password: hashedPassword, // Use the hashed password here
            email,
            no_hp,
            role,
        });

        res.status(201).json({ message: "Registrasi telah berhasil", user });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const Login = async (req, res) => {
    const {
        username, password
    } = req.body;

    try {
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(401).json({ message: "Username tidak ditemukan" });
        }

        const isMatch = bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Password salah" });
        }

        // Generate JWT without expiration
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.SECRET_KEY // No expiration time
        );

        // Set token akses tanpa refresh token
        res.cookie('token', token, { httpOnly: true, sameSite: "None", secure: true, path: "/" });

        res.status(200).json({ message: 'Login successful', user });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const LogOut = async (req, res) => {
    try {
        res.clearCookie('token', { httpOnly: true, sameSite: "None", secure: true, path: "/" });
        console.log('logout berhasil');
        res.status(200).json({ message: 'logout berhasil' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.status(200).json(users);
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    Register,
    Login,
    LogOut,
    getAllUsers
};
