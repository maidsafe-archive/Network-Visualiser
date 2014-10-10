var mongoose = require('mongoose');
var VaultInfo;
var MODEL_NAME = 'vaultInfo';
var SCHEMA = {
  vaultId: String,
  vaultIdFull: String,
  hostName: String,
  sessionId: String,
  isRunning: Boolean
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
    var temp = { vaultId: data.vaultId, isRunning: data.actionId === 0, sessionId: data.sessionId };
    if (data.actionId === 0) {
      temp.vaultIdFull = data.value1;
      temp.hostName = data.value2 || '';
    }
    return temp;
  };
  this.updateVaultStatus = function(data) {
    var promise = new mongoose.Promise();
    if (canUpdateStatus(data.actionId)) {
      data = transformData(data);
      VaultInfo.update({ vaultId: data.vaultId, sessionId: data.sessionId }, data, { upsert: true },
        function(err, doc) {
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
    return promise;
  };
  this.getActiveVaults = function(sessionId, callback) {
    var promise = new mongoose.Promise();
    if (callback) {
      promise.addBack(callback);
    }
    /* jscs:disable disallowDanglingUnderscores */
    VaultInfo.find({ sessionId: sessionId, isRunning: 1 }, { _id: 0, vaultId: 1, vaultIdFull: 1, hostName: 1 },
      function(err, vaults) {
        /* jscs:enable disallowDanglingUnderscores */
        promise.complete(vaults);
      });
    return promise;
  };
  this.getAllVaultNames = function(sessionId) {
    var promise = new mongoose.Promise();
    /* jscs:disable disallowDanglingUnderscores */
    VaultInfo.find({ sessionId: sessionId }, { _id: 0, vaultId: 1, vaultIdFull: 1, hostName: 1 },
      function(err, vaults) {
        /* jscs:enable disallowDanglingUnderscores */
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
    VaultInfo.find({ sessionId: sessionId }, { _id: 0, vaultId: 1 }, function(err, vaults) {
      /* jscs:enable disallowDanglingUnderscores */
      if (err || vaults.length === 0) {
        promise.error(err || 'No Info found');
        return;
      }
      VaultInfo.remove({ sessionId: sessionId }, function(removeErr, removeRes) {
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
