const db = require('../db/connection')
const {getProjectEmployeesByID} = require('../controllers/employeeController')


function getProjectByID(projectId) {
    return new Promise((resolve)=>{
        const results = db.query('SELECT * FROM projects WHERE project_id = ?', [projectId]);
        resolve(results);
    })
}

async function allProjects(req, res) {
    try {
        const results = await db.query('SELECT * FROM projects');
        res.json(results[0]);
    } catch (error) {
        res.status(400).json({ message: "Something went wrong", error })
    }
}

async function projectDetails(req, res) {

    try {
        const projectId = req.params.projectId;
        const results = await getProjectByID(projectId);
        if (results) {
            try {
                const employees = await getProjectEmployeesByID(projectId);
                results[0][0].employees = employees;
                res.json(results[0][0]);
            } catch (error) {
                res.status(400).json({ message: "Something went wrong" , error })
            }
        } else {
            res.status(400).json({ message: "Something went wrong" })
        }
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function addProject(req, res){

    try {
        const { manager_id, normal_employee_ids, project_name, project_description } = req.body;

        if (!manager_id || !normal_employee_ids || !project_name || !project_description) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        const results = await db.query('INSERT INTO projects (manager_id, project_name, project_description) VALUES (?, ?, ?)', [manager_id, project_name, project_description])
        const projectId = results.insertId;

        const normalEmployeeValues = await normal_employee_ids.map(employeeId => [projectId, employeeId]);
        await db.query('INSERT INTO project_employees (project_id, employee_id) VALUES ?', [normalEmployeeValues])

        res.json({ project_id: projectId, manager_id, normal_employee_ids, project_name });

    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function getManagerProjects (req, res){
    try {
        const results = await db.query('SELECT * FROM projects WHERE manager_id = ?', [req.employeeId])
        res.json(results[0]);
    } catch (error) {
        res.status(400).json({ message: "Something went wrong", error })
    }
}

module.exports = { allProjects, projectDetails, addProject ,getManagerProjects }