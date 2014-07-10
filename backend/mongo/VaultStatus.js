var mongoose = require('mongoose');
var utils = require('./../maidsafe/utils.js');

var VaultHealth = function(dbConnection) {

  var SCHEMA, VaultStatus, MODEL_NAME;
  var STATUS = { active: 'active', dead: "dead" };
  SCHEMA = {
    last_updated: { type: Date, default: Date.now },
    vault_id: String,
    vault_id_full: String,
    status: String
  };
  MODEL_NAME = 'vaultStatus';
  VaultStatus = mongoose.model(MODEL_NAME, new mongoose.Schema(SCHEMA), MODEL_NAME);
  utils.ensureUniqueDocInMongo(dbConnection, MODEL_NAME, 'vault_id');

  var canUpdateStatus = function(actionId) {
    return (actionId == 18 || actionId == 0);
  };
  var transformData = function(data) {
    var temp = { vault_id: data.vault_id, last_updated: data.ts, status: (data.action_id == 0) ? STATUS.active : STATUS.dead };
    if (data.action_id == 0) {
      temp.vault_id_full = data.value1;
    }
    return temp;
  };
  this.updateStatus = function(data) {
    var promise = new mongoose.Promise;
    console.log(JSON.stringify(data));
    if (canUpdateStatus(data.action_id)) {
      data = transformData(data);
      VaultStatus.update({ vault_id: data.vault_id }, data, { upsert: true }, function(err, doc) {
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
    VaultStatus.find({ status: STATUS.active }, function(err, vaults) {
      err ? promise.error(err) : promise.complete(vaults);
    });
    return promise;
  };
  this.isVaultActive = function(log) {
    var promise = new mongoose.Promise;
    VaultStatus.findOne({ vault_id: log.vault_id }, function(err, vault) {
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
    VaultStatus.find({}, { _id: 0, vault_id: 1, vault_id_full: 1 }, function(err, vaults) {
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
exports.VaultHealth = VaultHealth;