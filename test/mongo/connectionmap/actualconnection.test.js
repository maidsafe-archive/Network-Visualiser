/*jshint expr: true*/
/*jshint unused:false*/
var ActualConnection = require('../../../backend/mongo/connection_map/ActualConnection');
var should = require('should');
var dbHelper = require('../../../ci/test/DBHelper');

describe('ActualConnection Model', function() {
  var actualConnection;
  var prepareDB = function(done) {
    dbHelper.openConnection(function(err) {
      if (err) {
        done(err);
        return;
      }
      actualConnection = new ActualConnection(dbHelper.getDB());
      done();
    });
  };
  before(prepareDB);
  after(function(done) {
    dbHelper.closeAndDropDB();
    done();
  });
  it('Should throw error if unable to save the actual connection log', function(done) {
    var log = {
      vaultId: 'aaa...bbb',
      sessionId: 'ghghg..jhjhj',// .. in the session will not allow the mongo collection to be created
      actionId: 19
    };
    actualConnection.save(log, function(err) {
      should(err).be.ok;
      actualConnection.dropCollection('ghghg..jhjhj');
      done();
    });
  });
  it('Should be able to save the actual connection log', function(done) {
    var log = {
      vaultId: 'aaa...bbb',
      sessionId: 'ghghgjhjhj',// .. in the session will not allow the mongo collection to be created
      actionId: 19,
      valueOne: {
        vaultAdded: '',
        vaultRemoved: '',
        closeGroupVaults: ''
      }
    };
    actualConnection.save(log, function(err) {
      should(err).not.be.ok;
      done();
    });
  });
});
