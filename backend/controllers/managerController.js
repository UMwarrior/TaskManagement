const db = require('../db/connection')
const { generateManagerToken } = require('../auth/manager');

async function managerLogin(req, res) {
    try {
        const { employee_id, password } = req.body;

        if (!employee_id || !password) {
            res.status(400).json({ message: "Required Feilds are Missing" });
        }

        // Authenticate Manager
        const results = await db.query('SELECT * FROM employees WHERE employee_id = ? AND password = ?', [employee_id, password])
        if (results[0].length > 0) {
            const token = generateManagerToken(employee_id);
            res.json({ message: 'Manager authenticated successfully', token });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(400).json({ message: "Something went wrong", error })
    }
}

module.exports = { managerLogin }