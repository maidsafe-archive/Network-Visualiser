var bridge	=	require('./../../../backend/mongo/bridge.js')
var Handler = require('./Handler.js')
var utils = require('./../utils.js')
var url = require('url')
var config = require('./../../../Config.js')


var saveLog = function(req, res){
	var log = req.body;	
	console.log(log)
	utils.formatDate(log)
	if(log.value1 && log.value1.length>config.Constants.minLengthForDecode){
		log.value1 = utils.decodeData(log.value1)
	}
	if(log.value2 && log.value2.length>config.Constants.minLengthForDecode){
		log.value2 = utils.decodeData(log.value2)
	}
	if(!log.hasOwnProperty('persona_id'))
		log.persona_id = config.Constants.persona_na//NA
	utils.isValid(log)?bridge.addLog(log, new Handler.SaveLogHandler(res)):res.send(500, 'Invalid Parameters')
}


var searchLog = function(req, res){
	var criteria = url.parse(req.url, true).query	
	if(!criteria || utils.isEmptyObject(criteria)){
		res.send(500, 'Invalid search criteria')
		return;
	}else{
		utils.transformQuery(criteria)	
		bridge.searchLog(criteria, new Handler.SearchHandler(res))
	} 		
}		

var history = 	function(req, res){
	var criteria = url.parse(req.url, true).query
	var timeCriteria = criteria.ts?{'ts':{"$lt": criteria.ts}}:{}
	if(utils.isPageRequestValid(criteria))
		bridge.vaultHistory(criteria.vault_id, timeCriteria, parseInt(criteria.page), parseInt(criteria.max),  new Handler.SearchHandler(res)) 
	else
		res.send(500, 'Invalid Request')
}

var dropDB = function(req, res){
	bridge.dropDB()
	res.send('Dropped Database')
}		


var getCurrentActiveVaults = function(req, res){
	bridge.getActiveVaults().then(function(vaults){
		var counter = 0
		var results = {}
		if(!vaults.length){
			res.send(500, "No vaults are active")
			return
		}		
		for(var index in vaults){
			results[vaults[index].vault_id] = {vault_id_full: vaults[index].vault_id_full, logs:[]}														
			bridge.vaultHistory(vaults[index].vault_id, {}, 0, config.Constants.vault_logs_count).then(function(logs){				
				counter++
				if(logs.length>0)				
					results[logs[0].vault_id].logs = logs
				if(counter >= vaults.length)
					res.send(results)
			})
		}		
	})
}


var getActiveVaultsAtTime = function(criteria, res){
	bridge.getAllVaultNames().then(function(vaults){
		var results = {}
		var counter = 0		
		for(var index in vaults){			
			results[vaults[index].vault_id] = {vault_id_full: vaults[index].vault_id_full, logs:[]}														
			bridge.vaultHistory(vaults[index].vault_id, {ts:{'$lt':criteria.ts}}, 0, config.Constants.vault_logs_count).then(function(logs){												
				counter++				
				if(logs.length>0 && logs[logs.length-1] != 18)				
					results[logs[0].vault_id].logs = logs
				if(counter >= vaults.length)
					res.send(results)
			},function(err){
				console.log(err)
			})			
		}			
	})
}


var activeVaultsWithRecentLogs = function(req, res){
	var criteria = url.parse(req.url, true).query
	if(criteria.ts){
		getActiveVaultsAtTime(criteria, res)
	}else{
		getCurrentActiveVaults(req, res)
	}										
}


exports.saveLog = saveLog
exports.searchLog = searchLog
exports.vaultHistory = history
exports.clearAll = dropDB
exports.getActiveVaults = activeVaultsWithRecentLogs
