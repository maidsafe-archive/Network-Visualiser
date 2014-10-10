/*jshint expr: true*/
/*jshint unused:false*/

var should = require('should'); // jshint ignore:line
var dbHelper = require('../../ci/test/DBHelper');
var sessionHelper = require('../../ci/test/SessionHelper');
var logManager = require('../../backend/mongo/LogManager');
var vaultLog;
var log = { 'vaultId': 'aaaa-bbbb', 'value1': 'asdsds', 'actionId': 0 };

describe('LogManager', function() {
  var prepareDB = function(callback) {
    dbHelper.openConnection(function(err) {
      if (err) {
        callback(err);
        return;
      }
      vaultLog = logManager.getManager(dbHelper.getDB());
      sessionHelper = sessionHelper(dbHelper.getDB());
      sessionHelper.createTestSession(function(err) {
        err ? callback(err) : callback();
      });
    });
  };

  before(prepareDB);

  after(function(done) {
    dbHelper.closeAndDropDB();
    done();
  });

  var saveLog = function(log, callback) {
    vaultLog.save(sessionHelper.getSessionId(), log, callback);
  };

  var deleteLogs = function(vaults, callback) {
    vaultLog.deleteVaultsInSession(sessionHelper.getSessionId(), vaults, callback);
  };

  it('Should be able to save a log', function(done) {
    saveLog(log, function(err, data) {
      should(err).not.be.ok;
      should(data).be.ok;
      done();
    });
  });

  it('Should be able to delete vault logs', function(done) {
    saveLog(log, function(err, data) {
      should(err).not.be.ok;
      deleteLogs([ log ], function(err, data) {
        should(err).not.be.ok;
        should(data).be.exactly('');
        done();
      });
    });
  });

  it('Should not be able to get logs', function(done) {
    var deleteVaultLogs = function() {
      deleteLogs([ log ], function(err, data) {
        should(err).not.be.ok;
        should(data).be.exactly('');
        done();
      });
    };
    saveLog(log, function(err, data) {
      should(err).not.be.ok;
      vaultLog.selectLogs(sessionHelper.getSessionId(), {}, function(err, data) {
        should(err).not.be.ok;
        should(data).be.ok;
        deleteVaultLogs();
      });
    });
  });

  it('Should be able to get vault history', function(done) {
    var deleteVaultLogs = function() {
      deleteLogs([ log ], function(err, data) {
        should(err).not.be.ok;
        should(data).be.exactly('');
        done();
      });
    };
    saveLog(log, function(err, data) {
      should(err).not.be.ok;
      vaultLog.history(sessionHelper.getSessionId(), log.vaultId, {}, 0, 10, function(err, data) {
        should(err).not.be.ok;
        should(data).be.ok;
        deleteVaultLogs();
      });
    });
  });
});
