const express = require('express')
var bodyParser = require("body-parser");
var favicon = require('serve-favicon')
var path = require('path')
//const favicon = require('serve-favicon')

const app = express()
const port = 3333
app.use(bodyParser.urlencoded({ extended: true })); 

app.engine("html", require("ejs").renderFile);
app.use(express.static('public')); 
var server = app.listen(3333, function () {
  console.log("Server is running on port " + port);
});


app.set("view engine", "html");

app.engine("html", require("ejs").renderFile);


app.get("/", function (req, res) {
  console.log("Connected!");

  res.render("index.html", "")
});

    




