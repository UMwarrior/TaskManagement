const express = require("express");
const bodyParser = require("body-parser");

const adminRouter = require("./routes/admin")
const managerRouter = require("./routes/manager")


const db = require('./db/connection');

const app = express();

const PORT = process.env.port || 3000;


app.use(bodyParser.json());

app.use("/admin" , adminRouter)
app.use("/manager" , managerRouter)


app.listen(PORT , ()=>{
    console.log(`Server is running on port ${PORT}`);
})