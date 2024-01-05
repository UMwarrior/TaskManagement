const db = require('../db/connection');

async function getProjectEmployeesByID(projectId) {
    const results = await db.query('SELECT * FROM project_employees WHERE project_id = ?', [projectId]);
    let employees = [];
    for (let i = 0; i < results[0].length; i++) {
        const combination = results[0][i];
        employees.push(combination.employee_id)
    }
    return employees;
}

async function allEmployees(req, res) {
    try {
        const results = await db.query('SELECT * FROM employees')
        res.json(results[0]);
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


async function addEmployee(req, res) {
    try {
        const { employee_name, phone_number, password } = req.body;

        if (!employee_name || !phone_number || !password) {
            return res.status(400).json({ error: 'Required Feilds are Missing' });
        }
        try {
            const results = await db.query('INSERT INTO employees (employee_name, phone_number, password) VALUES (?, ?, ?)', [employee_name, phone_number, password])
            res.json({ employee_id: results.insertId, employee_name, phone_number });
        } catch (error) {
            res.status(400).json({ message: "Something went wrong", error })
        }

    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = { allEmployees, addEmployee ,getProjectEmployeesByID }