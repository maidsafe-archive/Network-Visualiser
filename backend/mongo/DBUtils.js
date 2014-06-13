var mongoose = require('mongoose');
var fs = require('fs');
var csv = require('fast-csv')


var DBUtil = function(dbConnection){
	var dbConn = dbConnection


	var ExportHandler = function(promise){
		var fetched = 0			
		var max = 0
		var outStream

		this.setTotalCount = function(count){
			max = count
		}

		this.setFile = function(outStream_){
			outStream = outStream_
		}

		this.callback = function(){			
			fetched++;
			if(fetched == max){		
				outStream.end()						
				promise.complete(outStream.path)
			}
		}

		return this
	}


	var VaultToCSV = function(vaultId, outStream, handler){

		var ACTION_TO_STRING = {
							0:'Vault Started', 1:'Increases count', 2:'Decreases count',
							3:'Blocked Delete Request',	4:'Account Transfer', 5:'Got Account Transferred',
							6:'Increase Subscribers', 7:'Decrease Subscribers',	8:'Move Chunk',
							9:'Marking Node up', 10:'Marking Node Down', 11:'Joining PMID Node',
							12:'Dropping PMID Node', 13:'Storing Chunk', 14:'Deleting Chunk',
							15:'Update Version', 16:'Remove Account', 17:'Network Health changed',
							18:'Vault Stopping'
						}

		var PERSONA_TO_STRING = {
							0 : 'MaidNode', 1 :'MpidNode', 2:'DataGetter', 
							3:'MaidManager', 4:'DataManager', 5:'PmidManager', 6:'PmidNode', 
							7:'MpidManager', 8:'VersionHandler', 9:'Cachehandler', 10:'NA'
						}						

		var writeToStream = function(){
			dbConn.db.collection(vaultId, function(err, col){
				var stream = col.find({}, {__id:0, __v:0}).stream()
				stream.on('data', function(doc){					
					outStream.write(doc.vault_id + ',' + doc.ts + ',' + ACTION_TO_STRING[doc.action_id] + ',' + PERSONA_TO_STRING[doc.persona_id] + ',' + (doc.value1 || '') + ',' + (doc.value2 || '') + '\n')					
				})
				stream.on('close', function(){					
					setTimeout(function(){handler.callback()}, 1000)
				})

			})						
		}
		writeToStream()
	}


	var ExportHelper = function(promise){
		var outStream		
		var handler	
		var isReady = false		
		
		this.setOutStream = function(stream){
			outStream = stream	
			handler = new ExportHandler(promise)
			handler.setFile(outStream)
			convert()
		}

		var convert = function(){			
			if(outStream && isReady){	
				outStream.write("Vault_Id,Timestamp,Action,Persona,Value1,Value2\n")			
				dbConn.db.collectionNames(function(e, colls){
					handler.setTotalCount(colls.length-2)		
					for(var i in colls){				
						if(colls[i].name.indexOf('system.index') < 0 && colls[i].name.indexOf('vaultStatus') < 0){
							new VaultToCSV(colls[i].name.replace( dbConn.name + '.',''), outStream, handler)					
						}
					}				
				});
			}			
		}

		this.streamReady = function(fd){	
			isReady = true				
			convert()	
		};

		return this;
	}


	var createTempFile = function(streamReadyCallback){
		this.fileName = "Logs_" + new Date().getTime() + ".csv"
		this.stream = fs.createWriteStream(this.fileName);
		this.stream.once('open', streamReadyCallback)	
		return this
	}



	this.exportLogs = function(){
		var promise = new mongoose.Promise		
		var helper = new ExportHelper(promise)
		var outFile = createTempFile(helper.streamReady)		
		helper.setOutStream(outFile.stream)					
		return promise
	}


	this.importLogs = function(filePath,  vaultStatus, logManager){
		var promise = new mongoose.Promise		
		var stream = fs.createReadStream(filePath);
		var firstRecord = true
		var log = {}
		csv.fromStream(stream)
		.on("record", function(data){
		 	if(firstRecord){
		 		firstRecord = false
		 	}else{		 		
		 		console
		 		log = { vault_id: data[0], action_id:data[1], persona_id:data[2], value1:(data[3]||''), value2 : (data[4]||'')}
		 		vaultStatus.updateStatus(log).then(function(){
					vaultStatus.isVaultActive(log).then(function(isActive){		
						if(isActive || log.action_id == 0 || log.action_id == 18)
							logManager.save(log, promise)								
					})	
				}, function(err){
					console.log('ERR ::' + err)
				});
		 	}		     
		})
		.on("end", function(){		    
		     promise.complete('Completed')
		 });
		return promise	
	}

	return this;
}



exports.getDBUtil = DBUtil