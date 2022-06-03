const express = require('express')
var bodyParser = require("body-parser");
var path = require('path')
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

app.get("favicon.png", function (req, res) {
  console.log("what");
});

app.get("/", function (req, res) {
  console.log("Connected!");

  res.render("mainpage.html", "")
});

app.get("/giveq", function (req, res) {
  res.render("404page.html");
});

app.get("/CustomQuery/:id" , function (req, res) {
  var id = req.params.id;
  console.log(id)
  title = ""
  current_query = ""
  
  var data = {current_query: "", title: ""}
  if( !QueryFactory(id, data)){
    return res.render("404page.html");
  }
  current_query = data.current_query;
  title = data.title;

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

function QueryFactory(resoure, data) {
  switch (resoure) {
    case "Soldiers":
      data.title = "All soldiers:";
      data.current_query = "select * from soldier s ORDER BY s.SoldierNum";
      break;
    case "Vehicles":
      data.title = "All vehicles:";
      data.current_query = "select * from vehicle";
      break;
    case "Bases":
      data.title = "All military bases:";
      data.current_query = "select * from military_base";
      break;
    case "Operations":
      data.title = "All operations:";
      data.current_query = "select * from soldier_in_op";
      break;
    case "Weapons":
      data.title = "All weapons:";
      data.current_query = "select * from weapon"
      break;
    case "Riffles":
      data.title = "All Riffles:";
      data.current_query = "select * from Rifle"
      break;
    case "Artillery":
      data.title = "All Artillery:";
      data.current_query = "select * from artillery"
      break;
    case "GazaLebanon":
      data.title = "Soldier participated in Gaza or Lebanon operations:";
      data.current_query = "select * \
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
      data.title = "Operation counting for soldiers:"
      data.current_query = 
      "select s.SoldierNum, s.Name, count(o.SoldierNum) as 'Op Count'\
      from soldier s, soldier_in_op o\
      where s.SoldierNum = o.SoldierNum\
      group by s.SoldierNum, s.Name\
      order by SoldierNum"
      break;
    case "AvailableVehicles":
      data.title = "Available vehicles in each base:"
      data.current_query = 
      "select  v.Base_ID, count(v.Vehicle_number)\
      from vehicle v\
      where v.InUse = 0\
      group by v.Base_ID";
      break;
    case "ArtilleryRangeAndCountPerDistrict":
      data.title = "Artillery Range And Count Per District:"
      data.current_query = "SELECT b.base_district , a.wtype, w.range as 'maximun_range_artillery', count(*) as 'count'\
      FROM artillery a NATURAL JOIN weapon w JOIN military_base b ON (a.baseID = b.ID)\
      WHERE NOT EXISTS (SELECT * FROM artillery a2 NATURAL JOIN weapon w2 JOIN military_base b2 ON (a2.baseID = b2.ID) \
      WHERE b2.base_district = b.base_district AND w2.range > w.range)\
      GROUP BY b.base_district, a.wtype, w.range\
      ORDER BY b.base_district"
      break;
    case "WeaponriesStatus":
      data.title = "Weaponries Status:";
      data.current_query = 
      "(SELECT w.Base_ID, w.ID, capacity, COUNT(*) AS actual, CASE WHEN capacity = COUNT(*) THEN 'TRUE' ELSE 'FALSE' END AS isFull\
      FROM rifle r JOIN weaponry w ON (r.baseID = w.Base_ID AND r.weaponryID = w.id)\
      GROUP BY w.Base_ID, w.ID, capacity\
      ORDER BY w.Base_ID, w.id)\
      UNION\
      SELECT w.Base_ID, w.ID, capacity, 0, CASE WHEN capacity = 0 THEN 'TRUE' ELSE 'FALSE' END AS isFull\
      FROM weaponry w where w.ID not in (\
      select r.weaponryID FROM rifle r\
      ORDER BY w.Base_ID, w.id)"
      break;
    default:
        return false;
  }
  return true;
}
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



