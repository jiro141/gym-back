// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'your_secret_key'; // Usa la misma clave secreta utilizada en el controlador de usuarios

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401); // Unauthorized
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.sendStatus(403); // Forbidden
    }
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
