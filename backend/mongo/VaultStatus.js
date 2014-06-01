var mongoose = require('mongoose');

var VaultHealth = function(dbConnection){

	var LOG_SCHEMA, HIDE_FIELDS, VaultStatus, MODEL_NAME;	

	var STATUS = {active:"active", dead:"dead"}
		
	HIDE_FIELDS = {_id:0, __v:0}
	LOG_SCHEMA = {
		last_updated: { type: Date, default: Date.now },
		vault_id: String,
		vault_id_long: String,
		status: String
	};
	MODEL_NAME = 'vaultStatus'

	VaultStatus = mongoose.model(MODEL_NAME, new mongoose.Schema(LOG_SCHEMA), MODEL_NAME);

	var canUpdateStatus = function(actionId){
		return (actionId ==18 || actionId == 0)
	}

	var transformData = function(data){
		return {vault_id:data.vault_id, vault_id_long: data.vault_id, last_updated: new Date(), status:(data.action_id==0)?STATUS.active:STATUS.dead}
	}

	this.updateStatus = function(data){	
		if(canUpdateStatus(data.action_id)){
			VaultStatus.update({vault_id:data.vault_id}, transformData(data), {upsert:true}, function(err){
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
	return this
}

exports.VaultHealth = VaultHealth