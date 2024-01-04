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

router.post('/create/task' , authenticateManager , (req,res) => {
    const {project_id , employee_id , duration , task_description} = req.body;

    if (!project_id || !employee_id || !duration || !task_description) {
        res.status(400).json({message: "Required Feilds are Missing"});
    }

    date = new Date();
    end_date = new Date(date.setDate(date.getDate() + duration));
    start_date = new Date();

    db.query('SELECT * FROM projects WHERE project_id = ? and manager_id = ?' , [project_id , req.employeeId] , (err , results)=>{
        if(err) throw err;

        if(results.length>0){
            db.query('SELECT * FROM project_employees WHERE project_id = ? and employee_id = ?' , [project_id , employee_id] , (err1 , results1)=>{
                if(err1) throw err1;
        
                if(results1.length>0){
                    db.query('INSERT INTO project_tasks (combination_id , status , assigning_date , last_date , task_description) VALUES (?,?,?,?,?)' , [results1[0].combination_id , 0 , start_date, end_date, task_description ] , (err2 , results2)=>{
                        if(err2) throw err2;
        
                        res.json({task_id:results2.insertId , project_id, employee_id, start_date, end_date});
                    })
                }
            })
        }
    })
})

router.get('/all/task', authenticateManager, (req, res) => {
    const {project_id} = req.body;

    if (!project_id) {
        res.status(400).json({message: "Required Feilds are Missing"});
    }

    db.query('SELECT * FROM projects WHERE project_id = ? and manager_id = ?' , [project_id , req.employeeId] , (err , results)=>{
        if(err) throw err;

        let tasks = [];

        if(results.length>0){
            db.query('SELECT * FROM project_employees WHERE project_id = ? ' , [project_id] , (err1 , results1)=>{
                if(err1) throw err1;
        
                if(results1.length>0){
                    for (let i = 0; i < results1.length; i++) {
                        db.query('SELECT * FROM project_tasks WHERE combination_id = ? ' , [results1[i].combination_id] , (err2 , results2)=>{
                            if(err2) throw err2;
                    
                            if(results2.length>0){
                                for (let j = 0; j < results2.length; j++) {
                                    results2[j].employee_id = results1[i].employee_id;
                                    tasks.push(results2[j]);
                                }
                            }
                            if (results1.length-1 === i) {
                                res.json({tasks});
                            }
                        })
                    }
                }
            })
        }else{
            res.status(403).json({message: "Access Denied"});
        }
    })
});

router.get('/completed/task', authenticateManager, (req, res) => {
    const {project_id} = req.body;

    if (!project_id) {
        res.status(400).json({message: "Required Feilds are Missing"});
    }

    db.query('SELECT * FROM projects WHERE project_id = ? and manager_id = ?' , [project_id , req.employeeId] , (err , results)=>{
        if(err) throw err;

        let tasks = [];

        if(results.length>0){
            db.query('SELECT * FROM project_employees WHERE project_id = ? ' , [project_id] , (err1 , results1)=>{
                if(err1) throw err1;
        
                if(results1.length>0){
                    for (let i = 0; i < results1.length; i++) {
                        db.query('SELECT * FROM project_tasks WHERE combination_id = ? and status = 1' , [results1[i].combination_id] , (err2 , results2)=>{
                            if(err2) throw err2;
                    
                            if(results2.length>0){
                                for (let j = 0; j < results2.length; j++) {
                                    results2[j].employee_id = results1[i].employee_id;
                                    tasks.push(results2[j]);
                                }
                            }
                            if (results1.length-1 === i) {
                                res.json({tasks});
                            }
                        })
                    }
                }
            })
        }else{
            res.status(403).json({message: "Access Denied"});
        }
    })
});

router.get('/pending/task', authenticateManager, (req, res) => {
    const {project_id} = req.body;

    if (!project_id) {
        res.status(400).json({message: "Required Feilds are Missing"});
    }

    db.query('SELECT * FROM projects WHERE project_id = ? and manager_id = ?' , [project_id , req.employeeId] , (err , results)=>{
        if(err) throw err;

        let tasks = [];

        if(results.length>0){
            db.query('SELECT * FROM project_employees WHERE project_id = ? ' , [project_id] , (err1 , results1)=>{
                if(err1) throw err1;
        
                if(results1.length>0){
                    for (let i = 0; i < results1.length; i++) {
                        db.query('SELECT * FROM project_tasks WHERE combination_id = ? and status = 0' , [results1[i].combination_id] , (err2 , results2)=>{
                            if(err2) throw err2;
                    
                            if(results2.length>0){
                                for (let j = 0; j < results2.length; j++) {
                                    results2[j].employee_id = results1[i].employee_id;
                                    tasks.push(results2[j]);
                                }
                            }
                            if (results1.length-1 === i) {
                                res.json({tasks});
                            }
                        })
                    }
                }
            })
        }else{
            res.status(403).json({message: "Access Denied"});
        }
    })
});


module.exports = router;