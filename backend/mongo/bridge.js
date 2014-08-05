var db, vaultLog;
var mongoose = require('mongoose');
var logManager = require('./LogManager.js');
var vaultInfo = require('./VaultInfo.js');
var sessionInfo = require('./SessionInfo.js');
var dbUtils = require('./DBUtils.js');
var config = require('./../../Config.js');
var utils = require('./../maidsafe/utils.js');

exports.setupMongooseConnection = function(callback) {
  mongoose.connect(config.Constants.mongo_con);
  db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', function() {
    console.log('Mongodb connected successfully');
    callback();
    vaultLog = logManager.getManager(db);
    vaultInfo = vaultInfo.VaultMetaData(db);
    sessionInfo = sessionInfo.SessionMetaData(db);
    dbUtils = dbUtils.getDBUtil(db);
  });
};

exports.addLog = function(log, promise, refreshSessionsCallback) {
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

        sessionInfo.updateSessionInfo(log, refreshSessionsCallback).then(function() {

          var sessionId = log.session_id;
          delete log.session_id;
          vaultLog.save(sessionId, log).then(function(data) {
            sessionInfo.getSessionNameForId(sessionId).then(function(sessionName) {
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
exports.selectLogs = function(sessionName, criteria, promise) {
  sessionInfo.getSessionIdForName(sessionName).then(function(sessionId) {
    vaultLog.selectLogs(sessionId, criteria, promise);
  });
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
exports.getAllVaultNames = function(sessionName) {
  var promise = new mongoose.Promise;
  sessionInfo.getSessionIdForName(sessionName).then(function(sessionId) {
    vaultInfo.getAllVaultNames(sessionId).then(function(vaults) {
      promise.complete(vaults);
    });
  }, function() {
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
exports.importLogs = function(sessionName, createdBy, fileName) {
  return dbUtils.importLogs(sessionName, createdBy, fileName, vaultInfo, sessionInfo, vaultLog);
};
exports.createSession = function(sessionName, createdBy, promise) {
  sessionInfo.createSession(sessionName, createdBy, promise);
};
exports.getCurrentSessions = function(userInfo) {
  return sessionInfo.getCurrentSessions(userInfo);
};
exports.getSessionCreatedByForName = function(sessionName) {
  return sessionInfo.getSessionCreatedByForName(sessionName);
};
exports.getSessionIdForName = function(sessionName) {
  return sessionInfo.getSessionIdForName(sessionName);
};
exports.deleteActiveSession = function(sessionName, promise) {
  sessionInfo.deleteSession(sessionName).then(function(sessionId) {
    vaultInfo.deleteVaultInfoForSession(sessionId).then(function(removedVaultIds) {
      vaultLog.deleteVaultsInSession(sessionId, removedVaultIds, promise);
    }, function(err) {
      promise(err);
    });
  }, function(err) {
    promise(err);
  });
};
exports.deletePendingSession = function(sessionName, promise) {
  sessionInfo.deleteSession(sessionName, promise);
};
exports.clearSession = function(sessionName) {
  var promise = new mongoose.Promise;
  if (db._readyState != 1) {
    promise.error('Db Not connected');
    return promise;
  }

  sessionInfo.clearActiveSession(sessionName).then(function(sessionId) {
    vaultInfo.deleteVaultInfoForSession(sessionId).then(function(removedVaultIds) {
      vaultLog.deleteVaultsInSession(sessionId, removedVaultIds).then(function(res) {
        promise.complete(res);
      }, function(err) {
        promise.error(err);
      });
    }, function(err) {
      promise.error(err);
    });
  }, function(err) {
    promise.error(err);
  });
  return promise;
};