const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { generateManagerToken } = require('../auth/manager');
const { authenticateManager } = require('../middleware/manager');


router.post('/login', (req, res) => {
    try {
        const { employee_id, password } = req.body;

        if (!employee_id || !password) {
            res.status(400).json({ message: "Required Feilds are Missing" });
        }

        // Authenticate Manager
        db.query('SELECT * FROM employees WHERE employee_id = ? AND password = ?', [employee_id, password])
            .then((results) => {
                if (results[0].length > 0) {
                    const token = generateManagerToken(employee_id);
                    res.json({ message: 'Manager authenticated successfully', token });
                } else {
                    res.status(401).json({ message: 'Invalid credentials' });
                }
            })
            .catch((error) => {
                res.status(400).json({ message: "Something went wrong", error })
            })
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.get('/all/project', authenticateManager, (req, res) => {
    try {
        db.query('SELECT * FROM projects WHERE manager_id = ?', [req.employeeId])
            .then((results) => {
                res.json(results[0]);
            })
            .catch((error) => {
                res.status(400).json({ message: "Something went wrong", error })
            });
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/project/:projectId', authenticateManager, (req, res) => {

    try {

        const projectId = req.params.projectId;

        db.query('SELECT * FROM projects WHERE project_id = ? and manager_id = ?', [projectId, req.employeeId])
            .then((results) => {
                if (results[0].length > 0) {
                    db.query('SELECT * FROM project_employees WHERE project_id = ?', [projectId])
                        .then((results1) => {
                            let employees = [];
                            for (let i = 0; i < results1[0].length; i++) {
                                const combination = results1[0][i];
                                employees.push(combination.employee_id)
                            }
                            results[0][0].employees = employees;
                            res.json(results[0][0]);
                        })
                        .catch((error) => {
                            res.status(400).json({ message: "Something went wrong", error })

                        });
                } else {
                    res.status(403).json({ message: 'Access Denied' });
                }
            })
            .catch((error) => {
                res.status(400).json({ message: "Something went wrong", error })
            });
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

router.post('/create/task', authenticateManager, (req, res) => {
    try {
        const { project_id, employee_id, duration, task_description } = req.body;

        if (!project_id || !employee_id || !duration || !task_description) {
            res.status(400).json({ message: "Required Feilds are Missing" });
        }

        date = new Date();
        end_date = new Date(date.setDate(date.getDate() + duration));
        start_date = new Date();

        db.query('SELECT * FROM projects WHERE project_id = ? and manager_id = ?', [project_id, req.employeeId])
            .then((results) => {
                if (results[0].length > 0) {
                    db.query('SELECT * FROM project_employees WHERE project_id = ? and employee_id = ?', [project_id, employee_id])
                        .then((results1) => {
                            if (results1[0].length > 0) {
                                db.query('INSERT INTO project_tasks (combination_id , status , assigning_date , last_date , task_description) VALUES (?,?,?,?,?)', [results1[0][0].combination_id, 0, start_date, end_date, task_description])
                                    .then((results2) => {
                                        res.json({ task_id: results2[0].insertId, project_id, employee_id, start_date, end_date });
                                    })
                                    .catch((error) => {
                                        res.status(400).json({ message: "Something went wrong", error })
                                    })
                            }
                        })
                        .catch((error) => {
                            res.status(400).json({ message: "Something went wrong", error })
                        })
                }
            })
            .catch((error) => {
                res.status(400).json({ message: "Something went wrong", error })
            })

    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

router.get('/all/task', authenticateManager, (req, res) => {
    try {

        const { project_id } = req.body;

        if (!project_id) {
            res.status(400).json({ message: "Required Feilds are Missing" });
        }

        db.query('SELECT * FROM projects WHERE project_id = ? and manager_id = ?', [project_id, req.employeeId])
            .then((results) => {
                let tasks = [];

                if (results[0].length > 0) {
                    db.query('SELECT * FROM project_employees WHERE project_id = ? ', [project_id])
                        .then((results1) => {
                            if (results1[0].length > 0) {
                                for (let i = 0; i < results1[0].length; i++) {
                                    db.query('SELECT * FROM project_tasks WHERE combination_id = ? ', [results1[0][i].combination_id])
                                        .then((results2) => {
                                            if (results2[0].length > 0) {
                                                for (let j = 0; j < results2[0].length; j++) {
                                                    results2[0][j].employee_id = results1[0][i].employee_id;
                                                    tasks.push(results2[0][j]);
                                                }
                                            }
                                            if (results1[0].length - 1 === i) {
                                                res.json({ tasks });
                                            }
                                        })
                                        .catch((error) => {
                                            res.status(400).json({ message: "Something went wrong", error })
                                        })
                                }
                            }
                        })
                        .catch((error) => {
                            res.status(400).json({ message: "Something went wrong", error })
                        })
                } else {
                    res.status(403).json({ message: "Access Denied" });
                }
            })
            .catch((error) => {
                res.status(400).json({ message: "Something went wrong", error })
            });
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/completed/task', authenticateManager, (req, res) => {
    try {
        const { project_id } = req.body;

        if (!project_id) {
            res.status(400).json({ message: "Required Feilds are Missing" });
        }

        db.query('SELECT * FROM projects WHERE project_id = ? and manager_id = ?', [project_id, req.employeeId])
            .then((results) => {
                let tasks = [];

                if (results[0].length > 0) {
                    db.query('SELECT * FROM project_employees WHERE project_id = ? ', [project_id])
                        .then((results1) => {
                            if (results1[0].length > 0) {
                                for (let i = 0; i < results1[0].length; i++) {
                                    db.query('SELECT * FROM project_tasks WHERE combination_id = ? and status = 1', [results1[0][i].combination_id])
                                        .then((results2) => {
                                            if (results2[0].length > 0) {
                                                for (let j = 0; j < results2[0].length; j++) {
                                                    results2[0][j].employee_id = results1[0][i].employee_id;
                                                    tasks.push(results2[0][j]);
                                                }
                                            }
                                            if (results1[0].length - 1 === i) {
                                                res.json({ tasks });
                                            }
                                        })
                                        .catch((error) => {
                                            res.status(400).json({ message: "Something went wrong", error })
                                        })
                                }
                            }
                        })
                        .catch((error) => {
                            res.status(400).json({ message: "Something went wrong", error })
                        })
                } else {
                    res.status(403).json({ message: "Access Denied" });
                }
            })
            .catch((error) => {
                res.status(400).json({ message: "Something went wrong", error })
            });
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/pending/task', authenticateManager, (req, res) => {
    try {
        const { project_id } = req.body;

        if (!project_id) {
            res.status(400).json({ message: "Required Feilds are Missing" });
        }

        db.query('SELECT * FROM projects WHERE project_id = ? and manager_id = ?', [project_id, req.employeeId])
            .then((results) => {
                let tasks = [];

                if (results[0].length > 0) {
                    db.query('SELECT * FROM project_employees WHERE project_id = ? ', [project_id])
                        .then((results1) => {
                            if (results1[0].length > 0) {
                                for (let i = 0; i < results1[0].length; i++) {
                                    db.query('SELECT * FROM project_tasks WHERE combination_id = ? and status = 0', [results1[0][i].combination_id])
                                        .then((results2) => {
                                            if (results2[0].length > 0) {
                                                for (let j = 0; j < results2[0].length; j++) {
                                                    results2[0][j].employee_id = results1[0][i].employee_id;
                                                    tasks.push(results2[0][j]);
                                                }
                                            }
                                            if (results1[0].length - 1 === i) {
                                                res.json({ tasks });
                                            }
                                        })
                                        .catch((error) => {
                                            res.status(400).json({ message: "Something went wrong", error })
                                        })
                                }
                            }
                        })
                        .catch((error) => {
                            res.status(400).json({ message: "Something went wrong", error })
                        })
                } else {
                    res.status(403).json({ message: "Access Denied" });
                }
            })
            .catch((error) => {
                res.status(400).json({ message: "Something went wrong", error })
            });
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


module.exports = router;