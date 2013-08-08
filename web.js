var http = require('http');
var fs = require ('fs');
var express = require('express');

var app = express.createServer(express.logger());


app.get('/', function(request, response) {
    var buf = fs.readFileSync('.index.html', 'utf8');
    var respuesta = buf.toString();
    response.send(respuesta);
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
