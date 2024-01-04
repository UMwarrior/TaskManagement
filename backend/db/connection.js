// db/connection.js

// Mysql version commmented is used earlier. It has a function named db.query() which is used as callbacks hell.

// const mysql = require('mysql');

// const db = mysql.createConnection({
//   host: '127.0.0.1',
//   port:'8889',
//   user: 'root',
//   password: 'root',
//   database: 'TaskManagement'
// });

// db.connect((err) => {
//   if (err) {
//     console.error('Error connecting to MySQL:', err);
//   } else {
//     console.log('Connected to MySQL database');
//   }
// });

// module.exports = db;


// This is the version used with promises.

const mysql = require('mysql2/promise');

const db = mysql.createPool({
    host: '127.0.0.1',
    port:'8889',
    user: 'root',
    password: 'root',
    database: 'TaskManagement'
});

module.exports = db;

