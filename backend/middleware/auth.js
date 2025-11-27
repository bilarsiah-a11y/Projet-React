const jwt = require('jsonwebtoken');
const JWT_SECRET = 'votre_cle_super_secrete_123';

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).send({ message: 'Token manquant', alertType: 'error' });
  }

  const token = authHeader.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).send({ message: 'Token invalide', alertType: 'error' });
    req.user = decoded;
    next();
  });
};

module.exports = { verifyToken, JWT_SECRET };