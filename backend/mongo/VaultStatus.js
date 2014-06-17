var mongoose = require('mongoose');

var VaultHealth = function(dbConnection){

	var SCHEMA, HIDE_FIELDS, VaultStatus, MODEL_NAME;
	var firstLogTime

	var STATUS = {active:'active', dead:"dead"}

	HIDE_FIELDS = {_id:0, __v:0}
	SCHEMA = {
		last_updated: { type: Date, default: Date.now },
		vault_id: String,
		vault_id_full: String,
		status: String,
		key: String,
		value:String
	};
	MODEL_NAME = 'vaultStatus'

	VaultStatus = mongoose.model(MODEL_NAME, new mongoose.Schema(SCHEMA), MODEL_NAME);

	var canUpdateStatus = function(actionId){
		return (actionId ==18 || actionId == 0)
	}

	var transformData = function(data){
		var temp = {vault_id:data.vault_id, last_updated: new Date(), status:(data.action_id==0)?STATUS.active:STATUS.dead, key:'vault'}
		if(data.action_id == 0){
			temp.vault_id_full = data.value1
		}
		return temp
	}

	this.clearFirstLogTime = function(){
		firstLogTime = null
	}

	this.updateStatus = function(data){
		var promise = new mongoose.Promise
		if(canUpdateStatus(data.action_id)){
			data = transformData(data)
			VaultStatus.update({vault_id:data.vault_id}, data, {upsert:true}, function(err, doc){
				if(err){
					console.log('Failed to update Status for vault - ' + data.vault_id)
					promise.error(err)
				}else if(!firstLogTime){
				console.log('set initial')
					var fisrtLog =  new VaultStatus({key:'firstLogTime', value:data.last_updated.toISOString()})
					fisrtLog.save(function(err, doc){
						if(err){
							promise.error(err)
						}else{
							firstLogTime = new Date().toISOString()
							promise.complete('')
						}
					})
				}else{
					promise.complete('')
				}
			});
		}else{
			promise.complete('')
		}
		return promise
	}

	this.getFirstLogTime = function(callback){
		return firstLogTime ||new Date().toISOString()
	}


	this.setFirstLogTime = function(firstLogTimeISO){//as iso string
		firstLogTime = firstLogTimeISO
		new VaultStatus({key:'firstLogTime', value:firstLogTimeISO}).save(function(err, doc){
			if(err)
				console.log(err)
		})

		console.log(firstLogTime)
	}

	this.getActiveVaults = function(callback){
		var promise = new mongoose.Promise
		if(callback) promise.addBack(callback)
		VaultStatus.find({status:STATUS.active}, function(err, vaults){
			err?promise.error(err):promise.complete(vaults)
		})
		return promise
	}

	this.isVaultActive = function(log){
		var promise = new mongoose.Promise
		VaultStatus.findOne({vault_id:log.vault_id}, function(err, vault){
			if(!vault){
				promise.complete(false)
			} else{
				err?promise.error(err):promise.complete(vault.status == STATUS.active)
			}
		})
		return promise
	}

	this.getAllVaultNames = function(){
		var promise = new mongoose.Promise
		VaultStatus.find({key:'vault'}, {_id:0, vault_id:1, vault_id_full:1}, function(err, vaults){
			if(err){
				promise.error(err)
			}else{
				promise.complete(vaults)
			}
		})
		return promise
	}

	var setFirstLogTimeFromDB = function(){
		VaultStatus.find({key:'firstLogTime'}, function(err, doc){
			if(!err && !doc.length == 0){
				firstLogTime = doc[0].value
				console.log(firstLogTime)
			}
		})

	}

	setFirstLogTimeFromDB()

	return this
}

exports.VaultHealth = VaultHealth