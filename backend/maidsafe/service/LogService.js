var bridge	=	require('./../../../backend/mongo/bridge.js')
var Handler = require('./Handler.js')
var utils = require('./../utils.js')
var url = require('url')


var saveLog = 	function(req, res){
					var log = url.parse(req.url, true).query;
					if(!log.ts) log.ts = new Date()
					utils.isValid(log)?bridge.addLog(log, new Handler.SaveLogHandler(res)):res.send('Invalid Parameters')
				}


var searchLog = function(req, res){
					var criteria = url.parse(req.url, true).query
					//validate the parms empty {} should not be passed
					utils.transformQuery(criteria)	
					bridge.searchLog(criteria, new Handler.SearchHandler(res))
				}		

var history = 	function(req, res){
					var criteria = url.parse(req.url, true).query
					//validate the params
					bridge.vaultHistory(criteria.vaultId, parseInt(criteria.page), parseInt(criteria.max),  new SearchHandler(res)) 
			  	}

var dropDB = function(req, res){
				bridge.dropDB()
				res.send('Dropeed Database')
			}				

var activeVaultsWithRecentLogs = function(req, res){
									bridge.getActiveVaults().then(function(vaults){
										var counter = 0
										var results = {}		
										for(var index in vaults){
											results[vaults[index].vault_id] = []											
											bridge.vaultHistory(vaults[index].vault_id, 0, 3).then(function(logs){
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