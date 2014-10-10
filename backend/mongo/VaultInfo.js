var mongoose = require('mongoose');
var VaultInfo;
var MODEL_NAME = 'vaultInfo';
var SCHEMA = {
  // jshint camelcase:false
  // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
  vaultId: String,
  vaultIdFull: String,
  hostName: String,
  sessionId: String,
  isRunning: Boolean
  // jshint camelcase:true
  // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
};
/**
 * Moving the SCHEMA creation above VaultMetaData to avoid
 * Multiple compilation error of the same Model thrown by Mongoose
 **/
VaultInfo = mongoose.model(MODEL_NAME, new mongoose.Schema(SCHEMA), MODEL_NAME);
var VaultMetaData = function() {
  var canUpdateStatus = function(actionId) {
    return (actionId === 18 || actionId === 0);
  };
  var transformData = function(data) {
    // jshint camelcase:false
    // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
    var temp = { vaultId: data.vaultId, isRunning: data.actionId === 0, sessionId: data.sessionId };
    if (data.actionId === 0) {
      temp.vaultIdFull = data.value1;
      temp.hostName = data.value2 || '';
    }
    // jshint camelcase:true
    // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
    return temp;
  };
  this.updateVaultStatus = function(data) {
    var promise = new mongoose.Promise();
    // jshint camelcase:false
    // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
    if (canUpdateStatus(data.actionId)) {
      data = transformData(data);
      VaultInfo.update({ vaultId: data.vaultId, sessionId: data.sessionId }, data, { upsert: true },
        function(err, doc) {
          // jshint camelcase:true
          // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
          if (err || doc === 0) {
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
    var promise = new mongoose.Promise();
    // jshint camelcase:false
    // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
    VaultInfo.findOne({ vaultId: log.vaultId, sessionId: log.sessionId }, { isRunning: 1 },
      function(err, vaultStatus) {
        if (!vaultStatus) {
          promise.complete(false);
        } else {
          if (err) {
            promise.error(err);
            return;
          }
          promise.complete(vaultStatus.isRunning);
        }
      });
    // jshint camelcase:true
    // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
    return promise;
  };
  this.getActiveVaults = function(sessionId, callback) {
    var promise = new mongoose.Promise();
    if (callback) {
      promise.addBack(callback);
    }
    // jshint camelcase:false
    // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
    /* jscs:disable disallowDanglingUnderscores */
    VaultInfo.find({ sessionId: sessionId, isRunning: 1 }, { _id: 0, vaultId: 1, vaultIdFull: 1, hostName: 1 },
      function(err, vaults) {
        // jshint camelcase:true
        // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
        /* jscs:enable disallowDanglingUnderscores */
        promise.complete(vaults);
      });
    return promise;
  };
  this.getAllVaultNames = function(sessionId) {
    var promise = new mongoose.Promise();
    /* jscs:disable disallowDanglingUnderscores */
    // jshint camelcase:false
    // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
    VaultInfo.find({ sessionId: sessionId }, { _id: 0, vaultId: 1, vaultIdFull: 1, hostName: 1 },
      function(err, vaults) {
        /* jscs:enable disallowDanglingUnderscores */
        // jshint camelcase:true
        // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
        if (err) {
          promise.error(err);
        } else {
          promise.complete(vaults);
        }
      });
    return promise;
  };
  this.deleteVaultInfoForSession = function(sessionId) {
    var promise = new mongoose.Promise();
    /* jscs:disable disallowDanglingUnderscores */
    // jshint camelcase:false
    // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
    VaultInfo.find({ sessionId: sessionId }, { _id: 0, vaultId: 1 }, function(err, vaults) {
      /* jscs:enable disallowDanglingUnderscores */
      // jshint camelcase:true
      // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
      if (err || vaults.length === 0) {
        promise.error(err || 'No Info found');
        return;
      }
      // jshint camelcase:false
      // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
      VaultInfo.remove({ sessionId: sessionId }, function(removeErr, removeRes) {
        // jshint camelcase:true
        // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
        if (removeErr || removeRes === 0) {
          promise.error(removeErr || 'Remove Vault Info failed');
          return;
        }
        promise.complete(vaults);
      });
    });
    return promise;
  };
  return this;
};
exports.VaultMetaData = VaultMetaData;
