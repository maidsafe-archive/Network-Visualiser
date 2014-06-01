var express = require('express')
var server = express()
var PORT = 8080

var INDEX_PAGE = '/client/index.html';

server.use(express.json());

server.configure(function(){
  server.use('/', express.static(__dirname));  
});

server.get('/', function(req, res){
	res.redirect(INDEX_PAGE)
})

server.listen(PORT)
console.log('Server started at ' + PORT)