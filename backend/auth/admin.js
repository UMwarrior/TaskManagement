const jwt = require('jsonwebtoken');

const generateAdminToken = (employeeId) => {
    const admin = 1;
    const token = jwt.sign({ employeeId, admin }, '12345678', { expiresIn: '1h' }); // Replace 'your_secret_key'
    return token;
};

module.exports = { generateAdminToken };