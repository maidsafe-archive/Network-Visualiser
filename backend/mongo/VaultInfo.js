var mongoose = require('mongoose');
var utils = require('./../maidsafe/utils.js');

var VaultMetaData = function(dbConnection) {

  var SCHEMA, VaultInfo, MODEL_NAME;
  SCHEMA = {
    vault_id: String,
    vault_id_full: String,
    session_id: String,
    is_running: Boolean
  };
  MODEL_NAME = 'vaultInfo';
  VaultInfo = mongoose.model(MODEL_NAME, new mongoose.Schema(SCHEMA), MODEL_NAME);
  utils.ensureUniqueDocInMongo(dbConnection, MODEL_NAME, 'vault_id');

  var canUpdateStatus = function(actionId) {
    return (actionId == 18 || actionId == 0);
  };
  var transformData = function(data) {
    if (!canUpdateStatus(data.action_id)) {
      return {};
    }

    var temp = { vault_id: data.vault_id, is_running: data.action_id == 0 };
    if (data.action_id == 0) {
      temp.vault_id_full = data.value1;
      temp.session_id = data.value2;
    }
    return temp;
  };
  this.updateVaultStatus = function(data) {
    var promise = new mongoose.Promise;
    var actionId = data.action_id;
    if (canUpdateStatus(data.action_id)) {
      data = transformData(data);
      VaultInfo.update({ vault_id: data.vault_id }, data, { upsert: actionId == 0 }, function(err, doc) {
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
  this.getVaultStatus = function(vaultId) {
    var promise = new mongoose.Promise;
    VaultInfo.findOne({ vault_id: vaultId }, { is_running: 1, session_id: 1 }, function(err, vaultStatus) {
      if (!vaultStatus) {
        promise.complete({});
      } else {
        err ? promise.error(err) : promise.complete(vaultStatus);
      }
    });
    return promise;
  };
  this.getActiveVaults = function(callback) {
    var promise = new mongoose.Promise;
    if (callback) {
      promise.addBack(callback);
    }
    VaultInfo.find({ is_running: true }, function(err, vaults) {
      err ? promise.error(err) : promise.complete(vaults);
    });
    return promise;
  };
  this.getAllVaultNames = function() {
    var promise = new mongoose.Promise;
    VaultInfo.find({}, { _id: 0, vault_id: 1, vault_id_full: 1 }, function(err, vaults) {
      if (err) {
        promise.error(err);
      } else {
        promise.complete(vaults);
      }
    });
    return promise;
  };
  return this;
};
exports.VaultMetaData = VaultMetaData;