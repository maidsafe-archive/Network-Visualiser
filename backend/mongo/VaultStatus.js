var mongoose = require('mongoose');

var VaultHealth = function(dbConnection){

	var SCHEMA, HIDE_FIELDS, VaultStatus, MODEL_NAME;	

	var STATUS = {active:'active', dead:"dead"}
		
	HIDE_FIELDS = {_id:0, __v:0}
	SCHEMA = {
		last_updated: { type: Date, default: Date.now },
		vault_id: String,
		vault_id_full: String,
		status: String
	};
	MODEL_NAME = 'vaultStatus'

	VaultStatus = mongoose.model(MODEL_NAME, new mongoose.Schema(SCHEMA), MODEL_NAME);

	var canUpdateStatus = function(actionId){
		return (actionId ==18 || actionId == 0)
	}

	var transformData = function(data){
		var temp = {vault_id:data.vault_id, last_updated: new Date(), status:(data.action_id==0)?STATUS.active:STATUS.dead}
		if(data.action_id == 0){
			temp.vault_id_full = data.value1
		}
		return temp
	}

	this.updateStatus = function(data){	
		
		if(canUpdateStatus(data.action_id)){
			VaultStatus.update({vault_id:data.vault_id}, transformData(data), {upsert:true}, function(err, doc){
				if(err) console.log('Failed to update Status for vault - ' + data.vault_id)
			});
		}					
		
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
	
	return this
}

exports.VaultHealth = VaultHealth