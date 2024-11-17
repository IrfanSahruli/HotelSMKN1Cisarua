const User = require("./../../models/User/users");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { where } = require("sequelize");
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
            { id: user.id, role: user.role, username: user.username },
            process.env.SECRET_KEY // No expiration time
        );

        // Set token akses tanpa refresh token
        res.cookie('token', token, { httpOnly: true, sameSite: "None", secure: true, path: "/" });

        res.status(200).json({ message: 'Login successful', user, token: token });
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

const getUsersByRole = async (req, res) => {
    const { role } = req.params; // Ambil role dari parameter URL

    try {
        // Ambil semua user berdasarkan role
        const users = await User.findAll({
            where: { role }, // Filter berdasarkan role
            attributes: ["id", "username", "email", "no_hp", "role"] // Batasi atribut yang diambil
        });

        // Jika tidak ada user dengan role tersebut
        if (users.length === 0) {
            return res.status(404).json({
                message: `Tidak ada pengguna dengan role '${role}'`
            });
        }

        res.status(200).json({
            message: `Sukses mengambil data users dengan role '${role}'`,
            data: users
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: `Gagal mengambil data users dengan role '${role}'`,
            error: error.message
        });
    }
};

const updateUserById = async (req, res) => {
    const { username, password, email, no_hp, role } = req.body;
    const { id } = req.params; // ID diambil dari parameter URL

    try {
        // Cari user berdasarkan ID
        const user = await User.findOne({
            where: {
                id: id
            }
        });

        // Jika user tidak ditemukan
        if (!user) {
            return res.status(404).json({
                message: `User dengan id ${id} tidak ditemukan`
            });
        }

        // Update user
        await User.update(
            {
                username: username,
                password: password,
                email: email,
                no_hp: no_hp,
                role: role
            },
            {
                where: { id: id } // Tentukan ID user yang ingin diupdate
            }
        );

        res.status(200).json({
            success: true,
            message: `Data user dengan id ${id} berhasil diupdate`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Fungsi Delete User
const deleteUser = async (req, res) => {
    const userId = req.params.id; // Ambil ID dari URL

    try {
        // Cari user berdasarkan ID
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Hapus user dari database
        await user.destroy();

        res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    Register,
    Login,
    LogOut,
    getAllUsers,
    getUsersByRole,
    updateUserById,
    deleteUser
};
