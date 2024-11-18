const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");
dotenv.config();

const protectApp = (roles = []) => (req, res, next) => {
    const authHeader = req.headers?.authorization; // Cek keberadaan header
    if (!authHeader) {
        return res.status(401).json({ message: 'Token tidak ditemukan, login dulu.' });
    }

    const token = authHeader.split(' ')[1]; // Ambil token setelah "Bearer"

    jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token tidak valid.' });
        }
        req.user = user;

        // Jika ada peran yang perlu dicek
        if (roles.length && !roles.includes(user.role)) {
            return res.status(403).json({ message: 'Akses ditolak.' });
        }

        next();
    });
};

module.exports = protectApp;