var mongoose = require('mongoose');
var utils = require('./../maidsafe/utils.js');
var SCHEMA, VaultInfo, MODEL_NAME;
SCHEMA = {
  vault_id: String,
  vault_id_full: String,
  host_name: String,
  session_id: String,
  is_running: Boolean
};
MODEL_NAME = 'vaultInfo';
VaultInfo = mongoose.model(MODEL_NAME, new mongoose.Schema(SCHEMA), MODEL_NAME);


var VaultMetaData = function(dbConnection) {

  var canUpdateStatus = function(actionId) {
    return (actionId == 18 || actionId == 0);
  };
  var transformData = function(data) {
    var temp = { vault_id: data.vault_id, is_running: data.action_id == 0, session_id: data.session_id };
    if (data.action_id == 0) {
      temp.vault_id_full = data.value1;
      temp.host_name = data.value2 || '';
    }
    return temp;
  };
  this.updateVaultStatus = function(data) {
    var promise = new mongoose.Promise;
    if (canUpdateStatus(data.action_id)) {
      data = transformData(data);
      VaultInfo.update({ vault_id: data.vault_id, session_id: data.session_id }, data, { upsert: true }, function(err, doc) {        
        if (err || doc == 0) {
          promise.error(err ? err : 'Vault is not active');
        } else {
          promise.complete('');
        }
      });
    } else {
      promise.complete('');
    }
    return promise;
  };
  this.isVaultActive = function(log) {
    var promise = new mongoose.Promise;
    VaultInfo.findOne({ vault_id: log.vault_id, session_id: log.session_id }, { is_running: 1 }, function(err, vaultStatus) {
      if (!vaultStatus) {
        promise.complete(false);
      } else {
        err ? promise.error(err) : promise.complete(vaultStatus.is_running);
      }
    });
    return promise;
  };
  this.getActiveVaults = function(sessionId, callback) {
    var promise = new mongoose.Promise;
    if (callback) {
      promise.addBack(callback);
    }

    VaultInfo.find({ session_id: sessionId }, { _id: 0, vault_id: 1, vault_id_full: 1, host_name: 1 }, function(err, vaults) {
      promise.complete(vaults);
    });
    return promise;
  };
  this.getAllVaultNames = function(sessionId) {
    var promise = new mongoose.Promise;
    VaultInfo.find({ session_id: sessionId }, { _id: 0, vault_id: 1, vault_id_full: 1, host_name: 1 }, function(err, vaults) {
      if (err) {
        promise.error(err);
      } else {
        promise.complete(vaults);
      }
    });
    return promise;
  };
  this.deleteVaultInfoForSession = function(sessionId) {
    var promise = new mongoose.Promise;
    VaultInfo.find({ session_id: sessionId }, { _id: 0, vault_id: 1 }, function(err, vaults) {
      if (err || vaults.length == 0) {
        promise.error(err || 'No Info found');
        return;
      }

      VaultInfo.remove({ session_id: sessionId }, function(removeErr, removeRes) {
        removeErr || removeRes == 0 ? promise.error(removeErr || 'Remove Vault Info failed') : promise.complete(vaults);
      });
    });
    return promise;
  };
  return this;
};
exports.VaultMetaData = VaultMetaData;