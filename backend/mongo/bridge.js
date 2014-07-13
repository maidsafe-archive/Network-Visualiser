var db, vaultLog;
var mongoose = require('mongoose');
var logManager = require('./LogManager.js');
var vaultInfo = require('./VaultInfo.js');
var sessionInfo = require('./SessionInfo.js');
var dbUtils = require('./DBUtils.js');
var config = require('./../../Config.js');
var utils = require('./../maidsafe/utils.js');

mongoose.connect(config.Constants.mongo_con);
db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
  console.log('Mongodb connected successfully');
  vaultLog = logManager.getManager(db);
  vaultInfo = vaultInfo.VaultMetaData(db);
  sessionInfo = sessionInfo.SessionMetaData(db);
  dbUtils = dbUtils.getDBUtil(db);
});

exports.addLog = function(log, promise) {
  sessionInfo.isValidSessionId(log).then(function(isValid) {
    if (!isValid) {
      promise('Invalid Session Id');
      return;
    }

    vaultInfo.updateVaultStatus(log).then(function() {
      vaultInfo.isVaultActive(log).then(function(isActive) {
        if (!isActive && log.action_id != 18) {
          promise('Vault is not active');
          return;
        }

        sessionInfo.updateSessionInfo(log).then(function() {
          vaultLog.save(log).then(function(data) {
            sessionInfo.getSessionNameForId(log.session_id).then(function(sessionName) {
              if (!data || !sessionName) {
                promise('Error adding log');
              } else {
                data.session_name = sessionName;
                promise(null, data);
              }
            });
          });
        });
      });
    }, function(updateStatusError) {
      promise(updateStatusError);
    });
  });
};
exports.searchLog = function(criteria, promise) {
  vaultLog.search(criteria, promise);
};
exports.vaultHistory = function(sessionName, vaultId, criteria, page, max, callback) {
  var promise = new mongoose.Promise;
  if (callback) {
    promise.addBack(callback);
  }

  sessionInfo.getSessionIdForName(sessionName).then(function(sessionId) {
    vaultLog.history(sessionId, vaultId, criteria, page, max).then(function(res) {
      promise.complete(res);
    });
  }, function(err) {
    promise.error(err);
  });
  return promise;
};
exports.getActiveVaults = function(sessionName) {
  var promise = new mongoose.Promise;
  sessionInfo.getSessionIdForName(sessionName).then(function(sessionId) {
    vaultInfo.getActiveVaults(sessionId).then(function(vaults) {
      promise.complete(vaults);
    });
  }, function(err) {
    promise.complete('');
  });
  return promise;
};
exports.getAllVaultNames = function (sessionName) {
  var promise = new mongoose.Promise;
  sessionInfo.getSessionIdForName(sessionName).then(function (sessionId) {
    vaultInfo.getAllVaultNames(sessionId).then(function (vaults) {
      promise.complete(vaults);
    });
  }, function (err) {
    promise.complete('');
  });
  return promise;
};
exports.getTimelineDates = function(sessionName, promise) {
  return sessionInfo.getTimelineDates(sessionName, promise);
};
exports.exportLogs = function(sessionName) {
  return dbUtils.exportLogs(sessionName, sessionInfo);
};
exports.importLogs = function(fileName) {
  return dbUtils.importLogs(fileName, vaultInfo, sessionInfo, vaultLog);
};
exports.createSession = function(sessionName, promise) {
  sessionInfo.createSession(sessionName, promise);
};
exports.getCurrentActiveSessions = function() {
  return sessionInfo.getCurrentActiveSessions();
};
exports.clearPendingSessions = function(promise) {
  sessionInfo.clearPendingSessions(promise);
};
exports.deleteSession = function(sessionName, promise) {
  sessionInfo.deleteSession(sessionName).then(function(sessionId) {
    vaultInfo.deleteVaultInfoForSession(sessionId).then(function(removedVaultIds) {
      vaultLog.deleteVaultsInSession(sessionId, removedVaultIds, promise);
    });
  }, function(err) {
    promise(err);
  });
};