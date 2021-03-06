const express = require('express')
var bodyParser = require("body-parser");
var path = require('path')
var mysql = require('mysql');
const res = require('express/lib/response');
const favicon = require('serve-favicon');
const { Console } = require('console');

const app = express()
const port = 3333
GeneralFields = [];
app.use(bodyParser.urlencoded({ extended: true })); 

app.set("view engine", "html");

app.engine("html", require("ejs").renderFile);
app.use(express.static('public')); 
    

var con = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'saartaler',
  database: 'army'
})

var server = app.listen(3333, function () {
  console.log("Server is running on port " + port);
});


app.get("/", function (req, res) {
  console.log("Connected!");

  res.render("mainpage.html", "")
});

app.get("/giveq", function (req, res) {
  res.render("404page.html");
});

app.get("/AddToTable", function (req, res) {
  if (con.state === "disconnected") {
    con.connect(function (err) {
      if (err) throw err;
    });
  }
  array = []
  console.log("Connected!");
  con.query(`select table_name from information_schema.tables where table_schema = 'army'`, function(err, tables){ 
    //console.log(tables);
    for(tb in tables){
      array.push(tables[tb]["TABLE_NAME"]);

    }
    res.render("selectTable.html", { tables : array })
  });
  
});

app.get("/AddTo/:id", function (req, res) {

  var table = req.params.id;
  if (con.state === "disconnected") {
    con.connect(function (err) {
      if (err) throw err;
    });
  }
  console.log("Connected!");

  var querya = con.query("select * from " + table, function (err, result, fields) {
    if (err) res.render("404page.html");
    a = [];
    for (f in fields) {
      a.push(fields[f]["name"]);
    }
    GeneralFields = a;
    res.render("AddPage.html", {fields: a, table: table});
  })
});


app.post("/SubmitAdd/:id", function(req, res){
  var table = req.params.id;
  if (con.state === "disconnected") {
    con.connect(function (err) {
      if (err) throw err;
    });
  }
  
  fields = "(";
  vals = "(";
  for(a in GeneralFields) {
    fields += modifyField(GeneralFields[a]) + ", "; 
    if(req.body[ GeneralFields[a]] != ""){
      vals += "\'" + req.body[ GeneralFields[a]] + "\'" + ", ";
    }else{
      vals += "null, ";
    }
  }
  fields = fields.slice(0, -2) + ")";
  vals = vals.slice(0, -2) + ")";
  query = "INSERT INTO " + 
  table + " " +  fields 
  + " VALUES " + 
  vals;
  var querya = con.query(query, function (err, result) {
    if (err) 
    {
    res.render("404page.html");
    console.log(err);
    return;
   }

    res.redirect("/CustomQuery/" + table);
  })
  
})
 

app.post("/SubmitRemove/:id", function (req, res) {
  var table = req.params.id;
  if (con.state === "disconnected") {
    con.connect(function (err) {
      if (err) throw err;
    });
  }

  query = "DELETE FROM " + table + " WHERE "
  somevalue = false;
  for(field in GeneralFields){

    if(req.body[GeneralFields[field]] != ""){
    query += modifyField(GeneralFields[field]) + " LIKE \'" + req.body[GeneralFields[field]] + "\' AND "
    somevalue = true;
    }
  }
  if(!somevalue) { return res.redirect("/CustomQuery/" + table);}
  query = query.slice(0, -5);

  var querya = con.query(query, function (err, result) {
    if (err) 
    {
    res.render("404page.html");
    console.log(err);
    return;
   }

    res.redirect("/CustomQuery/" + table);
  })
})

app.post("/SubmitUpdate/:id", function (req, res) {
  var table = req.params.id;
  if (con.state === "disconnected") {
    con.connect(function (err) {
      if (err) throw err;
    });
  }

  query = "UPDATE " + table + " t SET "
  NewChanged = false;
  for(field in GeneralFields){
    if(req.body["New " + GeneralFields[field]] != ""){
    query += "t." + modifyField(GeneralFields[field]) + " = \'" + req.body["New " + GeneralFields[field]] + "\', ";
    NewChanged = true;
    }
  }
  if(!NewChanged){ return res.redirect("/404page"); }
  query = query.slice(0, -2) + " WHERE ";

  for(field in GeneralFields){
    if(req.body["Existing " + GeneralFields[field]] != ""){
    query += "t." + modifyField(GeneralFields[field]) + " = \'" + req.body["Existing " + GeneralFields[field]] + "\', ";
    NewChanged = true;
    }
  }
  query = query.slice(0, -2);

  var querya = con.query(query, function (err, result) {
    if (err) 
    {
    res.render("404page.html");
    console.log(err);
    return;
   }

    res.redirect("/CustomQuery/" + table);
  })

})

app.get("/CustomQuery/:id" , function (req, res) {
  var id = req.params.id;
  console.log(id)
  title = ""
  current_query = ""
  
  var data = {current_query: "", title: "", changable: false}
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
    if (err) { res.render("404page.html")
    console.log(err) 
    return; }
    
    a = [];
    for (f in fields) {
      a.push(fields[f]["name"]);
    }
    GeneralFields = a;
    console.log(a);
    return res.render("secondpage.html", { result: result, fields: a, title: data.title, changable: data.changable, table: id });
  });
});



app.post("/Soldier", function (req, res) {
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
    if (err) return res.render("404page.html");
    if(result.length == 0) res.render("404page.html");
    a = [];
    for (f in fields) {
      a.push(fields[f]["name"]);
    }

    console.log(a);
    return res.render("secondpage.html", { result: result, fields: a, title: ("Soldier Number " + req.body["ID"] + ":"), changable: false, table: "Soldier " + req.body["ID"]});
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
    if (err) return res.render("404page.html");
    a = [];
    for (f in fields) {
      a.push(fields[f]["name"]);
    }

    console.log(a);
    return res.render("secondpage.html", { result: result, fields: a, title: "Custom query:", changable: false, table: "Custom query" });
  });

});


app.post("/Procs/:id", function (req, res) {
  var IDparam = req.body["ID"];
  var type = req.params.id;

  if(IDparam == "") { return res.redirect("/404page"); }
  var data = {current_proc: "", title: "", changable: false}
  if(!ProcFactory(type, data)) { return res.redirect("/404page"); }
  if (con.state === "disconnected") {
    con.connect(function (err) {
      if (err) throw err;
    });
  }
  console.log("Connected!");
  var querya = con.query(data.current_proc, IDparam, function (err, result, fields) {
    if (err) res.render("404page.html");
    console.log(result);
    console.log(fields);
    fields = fields[0];
    result = result[0];
    a = [];
    for (f in fields) {
      a.push(fields[f]["name"]);
    }
    console.log(a);
    return res.render("secondpage.html", { result: result, fields: a, title: data.title, changable: data.changable, table: data.title});
  });
});

app.post("/goback", function (req, res) {
  res.render("mainpage.html")
})

app.get("/404page", function (req, res) {
  res.render("404page.html")
})

function ProcFactory(resource, data) {
  switch (resource){
    case "SoldierVehicleProc":
      data.title = "Vehicles for soldiers:";
      data.current_proc = "CALL vehicles_for_soldier(?)";
      break;
    case "SoldierRifleProc":
      data.title = "rifles for soldiers:";
      data.current_proc = "CALL rifle_for_soldier(?)"
      break;
    case "RiflesInOpsProc":
      data.title = "rifles in operations:";
      data.current_proc = "CALL rifles_in_operation(?)"
      break;
    default:
      return false;
  }
  return true;

}

function QueryFactory(resoure, data) {
  switch (resoure) {
    case "soldier":
      data.title = "All soldiers:";
      data.current_query = "select * from soldier s ORDER BY s.SoldierNum";
      data.changable = true;
      break;
    case "vehicle":
      data.title = "All vehicles:";
      data.current_query = "select * from vehicle";
      data.changable = true;
      break;
    case "military_base":
      data.title = "All military bases:";
      data.current_query = "select * from military_base";
      data.changable = true;
      break;
    case "soldier_in_op":
      data.title = "All operations:";
      data.current_query = "select * from soldier_in_op";
      data.changable = true;
      break;
    case "weapon":
      data.title = "All weapons:";
      data.current_query = "select * from weapon"
      data.changable = true;
      break;
    case "weaponry":
      data.title = "All weaponries:"
      data.current_query = "select * from weaponry"
      data.changable = true;
      break;
    case "Rifle":
      data.title = "All Rifle:";
      data.current_query = "select * from Rifle"
      data.changable = true;
      break;
    case "artillery":
      data.title = "All Artillery:";
      data.current_query = "select * from artillery"
      data.changable = true;
      break;
    case "job": 
      data.title = "All Jobs:";
      data.current_query = "select * from job"
      data.changable = true;
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
    case "ArtilleryForce":
      data.title = "Artillery Force";
      data.current_query = 
      "select soldier.Force, count(*) as artilleryNum\
      from artillery\
      inner join soldier\
      ON artillery.commanderID = soldier.ID\
      group by soldier.Force"
      break;
    case "CommanderWithRifles":
      data.title = "Commander with rifle"
      data.current_query = 
      "select commanderID, MW.rifleNum\
      from weaponry, (Select MAX(rifleNum) as rifleNum, R.weaponryID\
                      from (SELECT Count(weaponryID) as rifleNum, weaponryID\
                              from rifle\
                              GROUP BY weaponryID) as R) as MW\
      where weaponry.commanderID = MW.weaponryID"
      break;
    case "RiflesInGaza":
      data.title = "Riffles in gaza";
      data.current_query = 
      "select *\
      from rifle\
      where rifle.ID IN(select soldier.Riffle_ID\
                          from soldier\
                          INNER JOIN soldier_in_op\
                          ON soldier.SoldierNum = soldier_in_op.SoldierNum AND soldier_in_op.Location = 'Gaza')"
      break;
    default:
        return false;
  }
  return true;
}

function getTables(array){
  if (con.state === "disconnected") {
    con.connect(function (err) {
      if (err) throw err;
    });
  }

  console.log("Connected!");
  con.query(`select table_name from information_schema.tables where table_schema = 'army'`, function(err, tables){ 
    //console.log(tables);
    for(tb in tables){
      array.push(tables[tb]["TABLE_NAME"]);
    }
  });
  
}

function modifyField(field){
 switch(field){ 
   case "Force":
   case "Rank":
   case "range":
     return "`" + field + "`";
     break;
   default:
     return field;
 }
}



