var express = require('express')
var server = express()

var INDEX_PAGE = '/client/index.html';

server.use(express.json());

server.configure(function(){
  server.use('/', express.static(__dirname));  
});

server.get('/', function(req, res){
	res.redirect(INDEX_PAGE)
})

server.listen(8080)
console.log('Server started at 8080')