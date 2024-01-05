const db = require('../db/connection');
const { generateAdminToken } = require('../auth/admin');
const { authenticateSuperAdmin } = require('../middleware/admin');


async function adminLogin(req, res) {
    try {
        const { employee_id, password } = req.body;

        if (!employee_id || !password) {
            res.status(400).json({ message: "Required Feilds are Missing" });
        }

        // Authenticate Super Admin (employee with admin flag = 1)
        try {
            const results = await db.query('SELECT employee_id FROM employees WHERE employee_id = ? AND password = ? AND admin = 1', [employee_id, password]);
            if (results[0].length > 0) {
                const token = generateAdminToken(employee_id);
                res.json({ message: 'Super Admin authenticated successfully', token });
            } else {
                res.status(401).json({ message: 'Invalid credentials' });
            }
        } catch (error) {
            res.status(400).json({ message: "Something went wrong", error })
        }

    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = { adminLogin }