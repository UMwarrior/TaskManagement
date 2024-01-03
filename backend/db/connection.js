// db/connection.js
const mysql = require('mysql');

const db = mysql.createConnection({
  host: '127.0.0.1',
  port:'8889',
  user: 'root',
  password: 'root',
  database: 'TaskManagement'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
  } else {
    console.log('Connected to MySQL database');
  }
});

module.exports = db;
