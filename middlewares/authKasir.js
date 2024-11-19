const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Mendapatkan token dari header

  if (!token) {
    return res.status(401).json({ message: 'Token tidak ditemukan, login dulu.' });
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token tidak valid.' });
    }
    req.user = user; // Menyimpan data pengguna di req.user
    next();
  });
};

module.exports = verifyToken;