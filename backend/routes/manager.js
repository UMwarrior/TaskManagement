const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { generateManagerToken } = require('../auth/manager');
const { authenticateManager } = require('../middleware/manager');


router.post('/login', (req, res) => {
    const { employee_id, password } = req.body;

    // Authenticate Super Admin (employee with admin flag = 1)
    db.query('SELECT * FROM employees WHERE employee_id = ? AND password = ?', [employee_id, password], (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
            const token = generateManagerToken(employee_id);
            res.json({ message: 'Manager authenticated successfully', token });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    });
});


// router.get('/all/employee', authenticateSuperAdmin, (req, res) => {
//     db.query('SELECT * FROM employees', (err, results) => {
//         if (err) throw err;
//         res.json(results);
//     });
// });

// router.post('/add/employee', authenticateSuperAdmin, (req, res) => {
//     try {
//         const { employee_name, phone_number, password } = req.body; // Assuming you send 'admin' flag in the request body

//         if (!employee_name || !phone_number || !password) {
//             // Check if required fields are missing
//             return res.status(400).json({ error: 'Missing required fields' });
//         }

//         db.query('INSERT INTO employees (employee_name, phone_number, password) VALUES (?, ?, ?)', [employee_name, phone_number, password], (err, result) => {
//             if (err) {
//                 console.error('Error inserting employee:', err);
//                 return res.status(500).json({ error: 'Internal Server Error' });
//             }

//             res.json({ employee_id: result.insertId, employee_name, phone_number });
//         });
//     } catch (error) {
//         console.error('Unexpected error:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// });

// router.put('/update/employee/:employeeId', authenticateSuperAdmin, (req, res) => {
//     const employeeId = req.params.employeeId;
//     const { employee_name, phone_number, password, admin } = req.body;
//     db.query('UPDATE employees SET employee_name = ?, phone_number = ?, password = ?, admin = ? WHERE employee_id = ?', [employee_name, phone_number, password, admin, employeeId], (err) => {
//         if (err) throw err;
//         res.json({ message: 'Employee updated successfully' });
//     });
// });

// // Delete employee by ID
// router.delete('/delete/employee/:employeeId', authenticateSuperAdmin, (req, res) => {
//     const employeeId = req.params.employeeId;
//     db.query('DELETE FROM employees WHERE employee_id = ?', [employeeId], (err) => {
//         if (err) throw err;
//         res.json({ message: 'Employee deleted successfully' });
//     });
// });


router.get('/all/project', authenticateManager, (req, res) => {
    db.query('SELECT * FROM projects WHERE manager_id = ?', [req.employeeId], (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

router.get('/project/:projectId', authenticateManager, (req, res) => {

    const projectId = req.params.projectId;
    db.query('SELECT * FROM projects WHERE project_id = ? and manager_id = ?', [projectId, req.employeeId], (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
            db.query('SELECT * FROM project_employees WHERE project_id = ?', [projectId], (err, results1) => {
                if (err) throw err;
                let employees = [];
                for (let i = 0; i < results1.length; i++) {
                    const combination = results1[i];
                    employees.push(combination.employee_id)
                }
                results[0].employees = employees;
                res.json(results[0]);
            });
        }else{
            res.status(403).json({ message: 'Access Denied' });
        }
    })
})
// router.post('/add/project', authenticateSuperAdmin, (req, res) => {

//     try {
//         const { manager_id, normal_employee_ids, project_name, project_description } = req.body;

//         if (!manager_id || !normal_employee_ids || !project_name || !project_description) {
//             // Check if required fields are missing
//             return res.status(400).json({ error: 'Missing required fields' });
//         }

//         db.query('INSERT INTO projects (manager_id, project_name, project_description) VALUES (?, ?, ?)', [manager_id, project_name, project_description], (err, result) => {
//             if (err) throw err;

//             const projectId = result.insertId;

//             res.json({ project_id: projectId, manager_id, normal_employee_ids, project_name });

//             const normalEmployeeValues = normal_employee_ids.map(employeeId => [projectId, employeeId]);
//             db.query('INSERT INTO project_employees (project_id, employee_id) VALUES ?', [normalEmployeeValues], (err) => {
//                 if (err) throw err;
//             });
//         });
//     } catch (error) {
//         console.error('Unexpected error:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// });

// // Update project by ID (Super Admin only)
// router.put('/update/project/:projectId', authenticateSuperAdmin, (req, res) => {
//     const projectId = req.params.projectId;
//     const { manager_id, normal_employee_ids, project_name, project_description } = req.body;

//     // Update project details in projects table
//     db.query('UPDATE projects SET manager_id = ?, project_name = ?, project_description = ? WHERE project_id = ?', [manager_id, project_name, project_description, projectId], (err) => {
//         if (err) throw err;

//         // Update normal employees associated with the project in project_employees table
//         const normalEmployeeValues = normal_employee_ids.map(employeeId => [projectId, employeeId]);
//         db.query('DELETE FROM project_employees WHERE project_id = ?', [projectId], (err) => {
//             if (err) throw err;

//             db.query('INSERT INTO project_employees (project_id, employee_id) VALUES ?', [normalEmployeeValues], (err) => {
//                 if (err) throw err;
//                 res.json({ message: 'Project updated successfully' });
//             });
//         });
//     });
// });

// // Delete project by ID (Super Admin only)
// router.delete('/delete/project/:projectId', authenticateSuperAdmin, (req, res) => {
//     const projectId = req.params.projectId;

//     // Delete project from projects table
//     db.query('DELETE FROM projects WHERE project_id = ?', [projectId], (err) => {
//         if (err) throw err;

//         // Also, delete entries from project_employees table related to the project
//         db.query('DELETE FROM project_employees WHERE project_id = ?', [projectId], (err) => {
//             if (err) throw err;
//             res.json({ message: 'Project deleted successfully' });
//         });
//     });
// });

module.exports = router;