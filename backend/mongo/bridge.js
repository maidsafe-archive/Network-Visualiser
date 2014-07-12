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
      vaultInfo.getVaultStatus(log.vault_id).then(function(vaultStatus) {
        if (utils.isEmptyObject(vaultStatus) || (!vaultStatus.is_running && log.action_id != 18)) {
          promise('Vault is not active');
          return;
        }

        sessionInfo.updateSessionInfo(vaultStatus.session_id, log).then(function() {
          vaultLog.save(log, promise);
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
exports.vaultHistory = function(vaultId, criteria, page, max, promise) {
  return vaultLog.history(vaultId, criteria, page, max, promise);
};
exports.dropDB = function() {
  db.db.dropDatabase();
  // keyValueData.clearDates();
};
exports.getActiveVaults = function() {
  return vaultInfo.getActiveVaults();
};
exports.getAllVaultNames = function() {
  return vaultInfo.getAllVaultNames();
};
exports.getTimelineDates = function(sessionName, promise) {
  return sessionInfo.getTimelineDates(sessionName, promise);
};
exports.exportLogs = function() {
  return dbUtils.exportLogs();
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