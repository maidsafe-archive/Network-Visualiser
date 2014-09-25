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

  var addVaultStatus = function(callback) {
    var data = {'vault_id': 'aaaa-bbbb', 'session_id': sessionHelper.getSessionId(),
    'action_id': 0, 'value1': 'aaaabbbbccccdddd'};
    vaultInfo.updateVaultStatus(data).then(function(data) {      
      callback(null, data);
    }, function(err) {
      callback(err);
    });
  };

  var deleteVaultInfoForSession = function(callback) {
     vaultInfo.deleteVaultInfoForSession(sessionHelper.getSessionId()).then(function(data) {     
      callback(null, data);
    }, function(err) {       
      callback(err);
    });
  }

  var updateVaultStoped = function(callback) {
    var data = {'vault_id': 'aaaa-bbbb', 'session_id': sessionHelper.getSessionId(),
    'action_id': 18, 'value1': 'aaaabbbbccccdddd'};
    vaultInfo.updateVaultStatus(data).then(function(data) {
      should(data).be.exactly('');
      callback(null, data)
    }, function(err) {
      should(err).not.be.ok;
      callback(err);
    });
  }

  before(prepareDB);

  after(function(done) {
    dbHelper.closeAndDropDB();
    done();
  });

  it('Should be able to add Vault status', function(done) {
    addVaultStatus(function(err, data){      
      should(err).not.be.ok;
      deleteVaultInfoForSession(function(err, data) {
        done();
      });
    });
  });

  it('Should be able to get all vault names in the session', function(done) {
    var deleteInfo = function() {
      deleteVaultInfoForSession(function() {
        done();
      });
    };
    addVaultStatus(function(err, data){
      should(err).not.be.ok;
      vaultInfo.getAllVaultNames(sessionHelper.getSessionId()).then(function(data) {
        should(data).be.ok;
        deleteInfo();
      }, function(err) {
        should(err).not.be.ok;
        deleteInfo();
      });
    });
  });

  it('Should be able to get active vaults', function(done) {
    var deleteInfo = function() {
      deleteVaultInfoForSession(function() {
        done();
      });
    };
    addVaultStatus(function(err, data){
      should(err).not.be.ok;
      vaultInfo.getActiveVaults(sessionHelper.getSessionId(), function(err, data) {
        should(err).not.be.ok;
        should(data.length).be.above(0);
        deleteInfo();
      });
    });    
  });

  it('Should be able to check is vault is active', function(done) {
    var deleteInfo = function() {
      deleteVaultInfoForSession(function() {
        done();
      });
    };
    addVaultStatus(function(err, data){
      should(err).not.be.ok;
      vaultInfo.isVaultActive({'session_id': sessionHelper.getSessionId(), 'vault_id': 'aaaa-bbbb'}).then(function(data) {
        should(data).be.ok;
        done();
      }, function(err) {
        should(err).not.be.ok;
        done();
      });
    });    
  });

  it('Should be able to check is vault is not active', function(done) {
    var deleteInfo = function() {
      deleteVaultInfoForSession(function() {
        done();
      });
    };
    addVaultStatus(function(err, data){
      should(err).not.be.ok;
      vaultInfo.isVaultActive({'session_id': sessionHelper.getSessionId(), 'vault_id': 'aaa-bbbb'}).then(function(data) {
        should(data).not.be.ok;
        done();
      }, function(err) {
        should(err).not.be.ok;
        done();
      });
    });
  });

  // Active vaults are not returning the expected value
  it('Active vaults should be 0', function(done) {
     var deleteInfo = function() {
      deleteVaultInfoForSession(function() {
        done();
      });
    };
    addVaultStatus(function(err, data){
      should(err).not.be.ok;
      updateVaultStoped(function(err, data){
        vaultInfo.getActiveVaults(sessionHelper.getSessionId(), function(err, data){
          should(err).not.be.ok;
          should(data.length).be.equal(0);
          done();
        });
      });
    });    
  });

  it('Should be able to delete Vaults for the session', function(done) {
    var deleteInfo = function() {
      deleteVaultInfoForSession(function() {
        done();
      });
    };
    addVaultStatus(function(err, data){
      should(err).not.be.ok;
      deleteVaultInfoForSession(function(err, data) {
        should(err).not.be.ok;
        vaultInfo.getActiveVaults(sessionHelper.getSessionId(), function(err, data) {
          should(err).not.be.ok;
          should(data.length).be.exactly(0);
          deleteInfo();
        });
      });
    });    
  });
});
