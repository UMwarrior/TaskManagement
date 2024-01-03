const jwt = require('jsonwebtoken');

const authenticateSuperAdmin = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized - Missing Token' });
  }

  jwt.verify(token, '12345678', (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized - Invalid Token' });
    }

    if (decoded.admin !== 1) {
      return res.status(403).json({ message: 'Forbidden - Not a Super Admin' });
    }

    req.employeeId = decoded.employeeId;
    next();
  });
};

module.exports = { authenticateSuperAdmin };