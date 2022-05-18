const express = require('express')
var bodyParser = require("body-parser");
var mysql = require('mysql')

const app = express()
const port = 5000
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "html");

app.engine("html", require("ejs").renderFile);

app.get("/", function (req, res) {
    console.log("Connected!");
  /*   var sql = require("mssql");

    // config for your database
    var config = {
        user: 'saartaler',
        password: 'mypassword',
        server: 'localhost', 
        database: 'SchoolDB' 
    };

    // connect to your database
    sql.connect(config, function (err) {
    
        if (err) console.log(err);

        // create Request object
        var request = new sql.Request();
           
        // query to the database and get the records
        request.query('select * from Student', function (err, recordset) {
            
            if (err) console.log(err)

            // send records as a response
            res.send(recordset);
            
        });
    });
});
app.post("/", (req, res) => {
    res.send("Hello World");
});*/

    res.sendFile(__dirname + "/views/mainpage.html");
  //res.render("mainpage.html");
});

var server = app.listen(5000, function () {
    console.log("Server is running on port " + port);
  });

/*
var con = mysql.createConnection({
host: 'localhost',
user: 'root',
password: 'saartaler',
database: 'army'
})


con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    var querya = con.query("select s.SoldierNum, s.Name, count(o.SoldierNum) as 'Op Count' from soldier s, soldier_in_op o where s.SoldierNum = o.SoldierNum group by s.SoldierNum, s.Name order by SoldierNum;", function (err, result, fields) {
        if (err) throw err;
        console.log(result);
      });
      
      con.query("select distinct op.Location, op.Date, how_many_soldiers_in_op(op.Date, op.Location) from soldier_in_op op;", function (err, result, fields) {
        if (err) throw err;
        console.log(result);
      });
  });*/



