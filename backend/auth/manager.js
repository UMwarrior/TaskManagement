const jwt = require('jsonwebtoken');

const generateManagerToken = (employeeId) => {
    const token = jwt.sign({ employeeId }, '12345678', { expiresIn: '1h' });
    return token;
};

module.exports = { generateManagerToken };