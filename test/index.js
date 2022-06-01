var express = require("express");
var app = express();
var bodyParser = require("body-parser");

name = "";

app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "html");

app.engine("html", require("ejs").renderFile);

app.get("/", function (req, res) {
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
  res.render("index.html");
});
app.post("/create", (req, res) => {
  const keys = Object.keys(req.body);

  for (key of keys) {
    if (req.body[key] == "") {
      return res.send("Please fill all the fields");
    }
  }
  console.log(req.body);
  let { avatar_url, birth, name, gender, services } = req.body;

  res.render("newFile.html", { name: name });
});

var server = app.listen(5000, function () {
  console.log("Server is running..");
});





var con = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'saartaler',
  database: 'army'
})


con.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");
  con.query("select s.SoldierNum, s.Name, count(o.SoldierNum) as 'Op Count' from soldier s, soldier_in_op o where s.SoldierNum = o.SoldierNum group by s.SoldierNum, s.Name order by SoldierNum;", function (err, result, fields) {
    if (err) throw err;
    console.log(result);
  });
  con.query("select distinct op.Location, op.Date, how_many_soldiers_in_op(op.Date, op.Location) from soldier_in_op op;", function (err, result, fields) {
    if (err) throw err;
    console.log(result);
  });
});
