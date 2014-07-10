var mongoose = require('mongoose');
var utils = require('./../maidsafe/utils.js');

var VaultMetaData = function(dbConnection) {

  var SCHEMA, VaultInfo, MODEL_NAME;
  var STATUS = { active: 'active', dead: "dead" };
  SCHEMA = {
    vault_id: String,
    vault_id_full: String,
    session_id: String,
    status: String
  };
  MODEL_NAME = 'vaultInfo';
  VaultInfo = mongoose.model(MODEL_NAME, new mongoose.Schema(SCHEMA), MODEL_NAME);
  utils.ensureUniqueDocInMongo(dbConnection, MODEL_NAME, 'vault_id');

  var canUpdateStatus = function(actionId) {
    return (actionId == 18 || actionId == 0);
  };
  var transformData = function(data) {
    var temp = { vault_id: data.vault_id, status: (data.action_id == 0) ? STATUS.active : STATUS.dead };
    if (data.action_id == 0) {
      temp.vault_id_full = data.value1;
      temp.session_id = data.session_id;
    }
    return temp;
  };
  this.updateStatus = function(data) {
    var promise = new mongoose.Promise;
    console.log(JSON.stringify(data));
    if (canUpdateStatus(data.action_id)) {
      data = transformData(data);
      VaultInfo.update({ vault_id: data.vault_id }, data, { upsert: true }, function(err, doc) {
        if (err) {
          console.log('Failed to update Status for vault - ' + data.vault_id);
          promise.error(err);
        } else {
          promise.complete('');
        }
      });
    } else {
      promise.complete('');
    }
    return promise;
  };
  this.getActiveVaults = function(callback) {
    var promise = new mongoose.Promise;
    if (callback) {
      promise.addBack(callback);
    }
    VaultInfo.find({ status: STATUS.active }, function(err, vaults) {
      err ? promise.error(err) : promise.complete(vaults);
    });
    return promise;
  };
  this.isVaultActive = function(log) {
    var promise = new mongoose.Promise;
    VaultInfo.findOne({ vault_id: log.vault_id }, function(err, vault) {
      if (!vault) {
        promise.complete(false);
      } else {
        err ? promise.error(err) : promise.complete(vault.status == STATUS.active);
      }
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