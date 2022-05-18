const express = require('express')
var bodyParser = require("body-parser");
var mysql = require('mysql')

const app = express()




var con = mysql.createConnection({
host: 'localhost',
user: 'root',
password: 'saartaler',
database: 'army'
})


con.connect(function(err) {
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
