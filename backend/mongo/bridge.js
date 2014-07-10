var db, vaultLog, mongoose, logManager, vaultStatus, keyValueData, dbUtils;
mongoose = require('mongoose');
logManager = require('./LogManager.js');
vaultStatus = require('./VaultStatus.js');
keyValueData = require('./KeyValueData.js');
dbUtils = require('./DBUtils.js');
config = require('./../../Config.js');


mongoose.connect(config.Constants.mongo_con);
db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
  console.log('Mongodb connected successfully');
  vaultLog = logManager.getManager(db);
  vaultStatus = vaultStatus.VaultHealth(db);
  keyValueData = keyValueData.KeyValueStorage(db);
  dbUtils = dbUtils.getDBUtil(db);
});

exports.addLog = function(log, promise) {
  vaultStatus.updateStatus(log).then(function() {
    keyValueData.checkAndUpdateDates(log).then(function() {
      vaultStatus.isVaultActive(log).then(function(isActive) {
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
  return vaultStatus.getActiveVaults();
};
exports.getAllVaultNames = function() {
  return vaultStatus.getAllVaultNames();
};
exports.getTimelineDates = function() {
  return keyValueData.getTimelineDates();
};
exports.exportLogs = function() {
  return dbUtils.exportLogs();
};
exports.importLogs = function(fileName) {
  return dbUtils.importLogs(fileName, vaultStatus, keyValueData, vaultLog);
};