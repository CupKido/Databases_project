const express = require('express')
var bodyParser = require("body-parser");
var mysql = require('mysql');
const res = require('express/lib/response');

const app = express()
const port = 80
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "html");

app.engine("html", require("ejs").renderFile);

var con = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'saartaler',
  database: 'army'
})

var server = app.listen(80, function () {
  console.log("Server is running on port " + port);
});

app.get("/", function (req, res) {
  console.log("Connected!");

  res.render("mainpage.html")
});

app.get("/giveq", function (req, res) {
  res.render("404page.html");
});

app.get("/CustomQuery/:id" , function (req, res) {
  var id = req.params.id;
  console.log(id)
  title = ""
  current_query = ""
  switch (id) {
    case "Soldiers":
      title = "All soldiers:";
      current_query = "select * from soldier s ORDER BY s.SoldierNum";
      break;
    case "Vehicles":
      title = "All vehicles:";
      current_query = "select * from vehicle";
      break;
    case "Bases":
      title = "All military bases:";
      current_query = "select * from military_base";
      break;
    case "Operations":
      title = "All operations:";
      current_query = "select * from soldier_in_op";
      break;
    case "Weapons":
      title = "All weapons:";
      current_query = "select * from weapon"
      break;
    case "Riffles":
      title = "All Riffles:";
      current_query = "select * from Rifle"
      break;
    case "Artillery":
      title = "All Artillery:";
      current_query = "select * from artillery"
      break;
    case "GazaLebanon":
      title = "Soldier participated in Gaza or Lebanon operations";
      current_query = "select * \
      from soldier s, (select op.SoldierNum, op.Location \
                      from soldier_in_op op \
                      where op.Location = 'Gaza'\
                      UNION\
                      select op.SoldierNum, op.Location\
                      from soldier_in_op op\
                      where op.Location = 'Lebanon') sNum\
      where s.SoldierNum = sNum.SoldierNum\
      ORDER BY sNum.Location"
      break;
    case "OpCount":
      title = "Operation counting for soldiers"
      current_query = 
      "select s.SoldierNum, s.Name, count(o.SoldierNum) as 'Op Count'\
      from soldier s, soldier_in_op o\
      where s.SoldierNum = o.SoldierNum\
      group by s.SoldierNum, s.Name\
      order by SoldierNum"
      break;
    case "AvailableVehicles":
      title = "Available vehicles in each bases"
      current_query = 
      "select  v.Base_ID, count(v.Vehicle_number)\
      from vehicle v\
      where v.InUse = 0\
      group by v.Base_ID";
      break;
    default:
        return res.render("404page.html");
  }

  if (con.state === "disconnected") {
    con.connect(function (err) {
      if (err) throw err;
    });
  }
  console.log("Connected!");
  var querya = con.query(current_query, function (err, result, fields) {
    if (err) res.render("404page.html");
    a = [];

    for (f in fields) {
      a.push(fields[f]["name"]);
    }
    
    console.log(a);
    return res.render("secondpage.html", { result: result, fields: a, title: title });
  });
});



app.post("/fill", function (req, res) {
  console.log("stuff received")
  const keys = Object.keys(req.body);
  for (key of keys) {
    console.log(key);
  }
  people = "";
  if (con.state === "disconnected") {
    con.connect(function (err) {
      if (err) throw err;
    });
  }
  console.log("Connected!");
  var querya = con.query("select * from soldier s \
  where s.SoldierNum =" + req.body["ID"], function (err, result, fields) {
    if (err) throw err;
    a = [];
    for (f in fields) {
      a.push(fields[f]["name"]);
    }

    console.log(a);
    return res.render("secondpage.html", { result: result, fields: a, title: ("Soldier Number " + req.body["ID"] + ":") });
  });


});

app.post("/giveq", function (req, res) {
  if (con.state === "disconnected") {
    con.connect(function (err) {
      if (err) throw err;
    });
  }
  console.log("Connected!");
  var querya = con.query(req.body["query"], function (err, result, fields) {
    if (err) res.render("404page.html");
    a = [];
    for (f in fields) {
      a.push(fields[f]["name"]);
    }

    console.log(a);
    return res.render("secondpage.html", { result: result, fields: a, title: "Custom query:" });
  });

});

app.post("/goback", function (req, res) {
  res.render("mainpage.html")
})


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



