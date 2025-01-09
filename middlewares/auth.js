const jwt = require('jsonwebtoken');
require('dotenv').config();

const protect = (roles = []) => {
    return (req, res, next) => {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ success: false, message: 'Login dulu guys' });
        }

        try {
            const decoded = jwt.verify(token, process.env.SECRET_KEY);
            req.user = decoded; // Simpan data user yang sudah didekodekan

            if (roles.length && !roles.includes(req.user.role)) {
                return res.status(403).json({ success: false, message: 'Forbidden' });
            }

            next();
        } catch (error) {
            res.status(401).json({ message: error.message });
        }
    };
};

module.exports = protect;