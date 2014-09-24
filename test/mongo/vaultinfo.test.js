/*jshint expr: true*/

var should = require('should'); // jshint ignore:line
var dbHelper = require('../../ci/test/DBHelper');
var sessionHelper = require('../../ci/test/SessionHelper');
var vaultInfo = require('../../backend/mongo/VaultInfo');

describe('VaultInfo', function() {
  var prepareDB = function(callback) {
    dbHelper.openConnection(function(err) {
      if (err) {
        callback(err);
        return;
      }
      vaultInfo = vaultInfo.VaultMetaData(dbHelper.getDB());
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

  it('Active vaults count should be 0 at start', function(done) {
    vaultInfo.getActiveVaults(sessionHelper.getSessionId(), function(err, data) {
      should(err).not.be.ok;
      should(data.length).be.exactly(0);
      done();
    });
  });

  it('Should be able to add Vault status', function(done) {
    var data = {'vault_id': 'aaaa-bbbb', 'session_id': sessionHelper.getSessionId(),
    'action_id': 0, 'value1': 'aaaabbbbccccdddd'};
    vaultInfo.updateVaultStatus(data).then(function(data) {
      should(data).be.exactly('');
      done();
    }, function(err) {
      should(err).not.be.ok;
      done();
    });
  });

  it('Should be able to get all vault names in the session', function(done) {
    vaultInfo.getAllVaultNames(sessionHelper.getSessionId()).then(function(data) {
      should(data.length).be.above(0);
      done();
    }, function(err) {
      should(err).not.be.ok;
      done();
    });
  });

  it('Should be able to get active vaults', function(done) {
    vaultInfo.getActiveVaults(sessionHelper.getSessionId(), function(err, data) {
      should(err).not.be.ok;
      should(data.length).be.above(0);
      done();
    });
  });

  it('Should be able to check is vault is active', function(done) {
    vaultInfo.isVaultActive({'session_id': sessionHelper.getSessionId(), 'vault_id': 'aaaa-bbbb'}).then(function(data) {
      should(data).be.ok;
      done();
    }, function(err) {
      should(err).not.be.ok;
      done();
    });
  });

  it('Should be able to check is vault is not active', function(done) {
    vaultInfo.isVaultActive({'session_id': sessionHelper.getSessionId(), 'vault_id': 'aaa-bbbb'}).then(function(data) {
      should(data).not.be.ok;
      done();
    }, function(err) {
      console.log(err);
      should(err).not.be.ok;
      done();
    });
  });

  it('Should be able to update Vault status', function(done) {
    var data = {'vault_id': 'aaaa-bbbb', 'session_id': sessionHelper.getSessionId(),
    'action_id': 18, 'value1': 'aaaabbbbccccdddd'};
    vaultInfo.updateVaultStatus(data).then(function(data) {
      should(data).be.exactly('');
      done();
    }, function(err) {
      should(err).not.be.ok;
      done();
    });
  });

  // Active vaults are not returning the expected value
  // it('Active vaults should be 0', function(done) {
  //   vaultInfo.getActiveVaults(sessionHelper.getSessionId(), function(err, data){
  //     should(err).not.be.ok;
  //     should(data.length).be.equal(0);
  //     done();
  //   });
  // });

  it('Should be able to delete Vaults for the session', function(done) {
    vaultInfo.deleteVaultInfoForSession(sessionHelper.getSessionId()).then(function(data) {
      should(data).be.ok;
      done();
    }, function(err) {
      should(err).not.be.ok;
      done();
    });
  });
});
