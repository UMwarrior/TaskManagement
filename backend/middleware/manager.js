const jwt = require('jsonwebtoken');

const authenticateManager = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized - Missing Token' });
  }

  jwt.verify(token, '12345678', (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized - Invalid Token' });
    }

    req.employeeId = decoded.employeeId;
    next();
  });
};

module.exports = { authenticateManager};