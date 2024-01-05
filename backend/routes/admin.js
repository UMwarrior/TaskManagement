const express = require('express');
const router = express.Router();
const db = require('../db/connection');

const { authenticateSuperAdmin } = require('../middleware/admin');

const {adminLogin} = require('../controllers/adminController');
const {allEmployees , addEmployee} = require('../controllers/employeeController')
const {allProjects ,projectDetails , addProject} = require('../controllers/projectController')


router.post('/login', adminLogin);
router.get('/all/employee', authenticateSuperAdmin, allEmployees);
router.post('/add/employee', authenticateSuperAdmin, addEmployee);
router.get('/all/project', authenticateSuperAdmin, allProjects);
router.get('/project/:projectId', authenticateSuperAdmin, projectDetails)
router.post('/add/project', authenticateSuperAdmin, addProject);

module.exports = router;