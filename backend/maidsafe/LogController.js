var logService = require('./service/LogService.js')

var saveLogs = 	function(req, res){
					logService.saveLog(req, res)
				}


var getActiveVaults = 	function(req, res){
							logService.getActiveVaults(req, res)
						}

var clearDB = 	function(req, res){
					logService.clearAll(req, res)
				}

exports.register = 	function(server){
						server.get('/logs', saveLogs);
						server.get('/vaults', getActiveVaults);
						server.get('/clearLogs', clearDB);
					}
