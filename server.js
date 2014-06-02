var express = require('express')
var logController = require('./backend/maidsafe/LogController.js')
var config = require('./Config.js')

var server = express()

var PORT = config.Constants.serverPort
var INDEX_PAGE = config.Constants.landingPage

server.use(express.json());

server.configure(function(){
  server.use('/', express.static(__dirname));  
})

server.get('/', function(req, res){
	res.redirect(INDEX_PAGE)
})

logController.register(server)

server.listen(PORT)
console.log('Server started at ' + PORT)
