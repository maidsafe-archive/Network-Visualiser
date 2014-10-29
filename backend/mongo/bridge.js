var db;
var vaultLog;
var mongoose = require('mongoose');
var logManager = require('./LogManager.js');
var vaultInfo = require('./VaultInfo.js');
var sessionInfo = require('./SessionInfo.js');
var testnetStatus = require('./TestnetStatus.js');
var dbUtils = require('./DBUtils.js');
var config = require('./../../Config.js');
var connectionMapBridge = require('./connection_map/connectionmapbridge');
var QueueService = require('../maidsafe/service/QueueService');
var connectionMap = connectionMapBridge.bridge;
var sessionMapper = require('./../socket/SessionMapper');
exports.setupMongooseConnection = function(callback, path) {
  mongoose.connect(path || config.Constants.mongoCon, function(connectionError) {
    if (connectionError) {
      callback(connectionError);
      return;
    }
    db = mongoose.connection;
    db.on('error', function() {
      console.error.bind(console, 'connection error:');
    });
    console.log('Mongodb connected successfully');
    vaultLog = logManager.getManager(db);
    vaultInfo = vaultInfo.VaultMetaData();
    sessionInfo = sessionInfo.SessionMetaData(db);
    testnetStatus = testnetStatus.TestnetStatusInfo(db);
    dbUtils = dbUtils.getDBUtil(db);
    connectionMap.setDB(db);
    callback();
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
        if (!isActive && log.actionId !== 18) {
          promise('Vault is not active');
          return;
        }
        sessionInfo.updateSessionInfo(log, refreshSessionsCallback).then(function() {
          var sessionId = log.sessionId;
          delete log.sessionId;
          vaultLog.save(sessionId, log, function(err, data) {
            if (err) {
              promise(err);
              return;
            }
            sessionInfo.getSessionNameForId(sessionId).then(function(sessionName) {
              if (!data || !sessionName) {
                promise('Error adding log');
              } else {
                data.sessionName = sessionName;
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
var vaultHistory = exports.vaultHistory = function(sessionName, vaultId, criteria, page, max, callback) {
  var promise = new mongoose.Promise();
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
exports.getActiveVaultsFullId = function(sessionId) {
  var promise = new mongoose.Promise();
  vaultInfo.getActiveVaults(sessionId).then(function(vaults) {
    promise.complete(vaults);
  }, function(err) {
    promise.error(err);
  });
  return promise;
};
exports.getActiveVaults = function(sessionName) {
  var promise = new mongoose.Promise();
  sessionInfo.getSessionIdForName(sessionName).then(function(sessionId) {
    vaultInfo.getActiveVaults(sessionId).then(function(vaults) {
      promise.complete(vaults);
    });
  }, function(err) {
    promise.error(err);
  });
  return promise;
};
exports.getAllVaultNames = function(sessionName) {
  var promise = new mongoose.Promise();
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
  var deleteSession = function() {
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
  sessionInfo.getSessionIdForName(sessionName).then(function(sessionId) {
    QueueService.deleteQueue(sessionId);
    connectionMap.dropActualLog(sessionId);
    connectionMap.dropExpectedConnections(sessionId);
    sessionMapper.remove(sessionId);
    deleteSession();
  }, function(err) {
    console.error(err);
  });
};
exports.deletePendingSession = function(sessionName, promise) {
  sessionInfo.deleteSession(sessionName, promise);
};
exports.clearActiveSession = function(sessionName, callback) {
  var promise = new mongoose.Promise();
  if (callback) {
    promise.addBack(callback);
  }
  /* jscs:disable disallowDanglingUnderscores */
  if (db._readyState !== 1) {
    /* jscs:enable disallowDanglingUnderscores */
    promise.error('Db Not connected');
    return promise;
  }
  sessionInfo.clearActiveSession(sessionName).then(function(sessionId) {
    QueueService.deleteQueue(sessionId);
    connectionMap.dropActualLog(sessionId);
    connectionMap.dropExpectedConnections(sessionId);
    sessionMapper.remove(sessionId);
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
exports.updateTestnetStatus = function(data) {
  return testnetStatus.updateTestnetStatus(data);
};
exports.getTestnetStatus = function() {
  return testnetStatus.getTestnetStatus();
};
exports.getActiveVaultsAtTime = function(sessionId, timestamp, callback) {
  var promise = new mongoose.Promise();
  var results = {};
  var activeVaults = [];
  var counter = 0;
  if (callback) {
    promise.addBack(callback);
  }
  var filterActiveVaults = function(vaults) {
    var onError =  function(err) {
      console.error(new  Date().toISOString() + " : " + err.message || err);
      counter++;
      if (counter >= vaults.length) {
        promise.complete(activeVaults);
      }
    };
    var onSuccess = function(data) {
      counter++;
      if (data && data.active) {
        activeVaults.push(results[data.vaultId]);
      }
      if (counter >= vaults.length) {
        promise.complete(activeVaults);
      }
    };
    if (vaults.length === 0) {
      promise.error('No active vaults');
      return;
    }
    for (var index in vaults) {
      if (vaults[index] && vaults[index].vaultId) {
        results[vaults[index].vaultId] = {
          vaultId: vaults[index].vaultId,
          vaultIdFull: vaults[index].vaultIdFull,
          hostName: vaults[index].hostName
        };
        // fetch only the last log message
        vaultLog.isVaultActive(sessionId, vaults[index].vaultId, timestamp).then(onSuccess, onError);
      }
    }
  };
  vaultInfo.getAllVaultNames(sessionId).then(filterActiveVaults, function(err) {
    promise.error(err);
  });
  return promise;
};
exports.connectionMap = connectionMap;
