var db, vaultLog;
var mongoose = require('mongoose');
var logManager = require('./LogManager.js');
var vaultInfo = require('./VaultInfo.js');
var sessionInfo = require('./SessionInfo.js');
var keyValueData = require('./KeyValueData.js');
var dbUtils = require('./DBUtils.js');
var config = require('./../../Config.js');


mongoose.connect(config.Constants.mongo_con);
db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
  console.log('Mongodb connected successfully');
  vaultLog = logManager.getManager(db);
  vaultInfo = vaultInfo.VaultMetaData(db);
  sessionInfo = sessionInfo.SessionMetaData(db);
  keyValueData = keyValueData.KeyValueStorage(db);
  dbUtils = dbUtils.getDBUtil(db);
});

exports.addLog = function(log, promise) {
  vaultInfo.updateStatus(log).then(function() {
    keyValueData.checkAndUpdateDates(log).then(function() {
      vaultInfo.isVaultActive(log).then(function(isActive) {
        if (isActive || log.action_id == 0 || log.action_id == 18) {
          vaultLog.save(log, promise);
        } else {
          if (promise) {
            promise('Vault is not active');
          }
        }
      });
    });
  }, function(err) {
    console.log('ERR ::' + err);
  });

};
exports.searchLog = function(criteria, promise) {
  vaultLog.search(criteria, promise);
};
exports.vaultHistory = function(vaultId, criteria, page, max, promise) {
  return vaultLog.history(vaultId, criteria, page, max, promise);
};
exports.dropDB = function() {
  db.db.dropDatabase();
  keyValueData.clearDates();
};
exports.getActiveVaults = function() {
  return vaultInfo.getActiveVaults();
};
exports.getAllVaultNames = function() {
  return vaultInfo.getAllVaultNames();
};
exports.getTimelineDates = function() {
  return keyValueData.getTimelineDates();
};
exports.exportLogs = function() {
  return dbUtils.exportLogs();
};
exports.importLogs = function(fileName) {
  return dbUtils.importLogs(fileName, vaultInfo, keyValueData, vaultLog);
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