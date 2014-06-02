var bridge	=	require('./../../../backend/mongo/bridge.js')
var Handler = require('./Handler.js')
var utils = require('./../utils.js')
var url = require('url')
var config = require('./../../../Config.js')


var saveLog = 	function(req, res){
	var log = url.parse(req.url, true).query;
	utils.formatDate(log)
	utils.isValid(log)?bridge.addLog(log, new Handler.SaveLogHandler(res)):res.send('Invalid Parameters')
}


var searchLog = function(req, res){
	var criteria = url.parse(req.url, true).query
	if(!criteria || utils.isEmptyObject(criteria)){
		res.send('Invalid search criteria')
		return;
	}else{
		utils.transformQuery(criteria)	
		bridge.searchLog(criteria, new Handler.SearchHandler(res))
	} 		
}		

var history = 	function(req, res){
	var criteria = url.parse(req.url, true).query
	if(utils.isPageRequestValid(criteria))
		bridge.vaultHistory(criteria.vault_id, parseInt(criteria.page), parseInt(criteria.max),  new Handler.SearchHandler(res)) 
	else
		res.send('Invalid Request')
}

var dropDB = function(req, res){
	bridge.dropDB()
	res.send('Dropped Database')
}				

var activeVaultsWithRecentLogs = function(req, res){
	bridge.getActiveVaults().then(function(vaults){
		var counter = 0
		var results = {}		
		for(var index in vaults){
			results[vaults[index].vault_id] = []											
			bridge.vaultHistory(vaults[index].vault_id, 0, config.Constants.vault_logs_count).then(function(logs){
				counter++
				if(logs.length>0)				
					results[logs[0].vault_id] = logs
				if(counter >= vaults.length)
					res.send(results)
			})
		}		
	})									
}

exports.saveLog = saveLog
exports.searchLog = searchLog
exports.vaultHistory = history
exports.clearAll = dropDB
exports.getActiveVaults = activeVaultsWithRecentLogs