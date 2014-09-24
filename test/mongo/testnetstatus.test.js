/*jshint expr: true*/

var should = require('should'); // jshint ignore:line
var config = require('../Config');
var mongoose = require('mongoose');
var testnetStatus = require('../../backend/mongo/TestnetStatus');
var db;

describe('Testnet Status', function() {
  var statusModel = {'last_updated': '', isReady: false};

  var prepareDB = function(callback) {
    mongoose.connect(config.Constants.mongoCon, function(connectionError) {
      if (connectionError) {
        callback(connectionError);
        return;
      }
      db = mongoose.connection;
      db.on('error', function() {
        console.error.bind(console, 'connection error:');
      });
      testnetStatus = testnetStatus.TestnetStatusInfo(db);
      callback();
    });
  };

  before(function(done) {
    prepareDB(done);
  });

  it('Should be able to add testnet status', function(done) {
    testnetStatus.updateTestnetStatus(statusModel).then(function(data) {
      should(data).be.ok;
      done();
    }, function(err) {
      should(err).not.be.ok;
      done();
    });
  });

  it('Should be able to update testnet status', function(done) {
    statusModel.isReady = true;
    testnetStatus.updateTestnetStatus(statusModel).then(function(data) {
      should(data).be.ok;
      done();
    }, function(err) {
      should(err).not.be.ok;
      done();
    });
  });

  it('Should be able to get testnet status', function(done) {
    statusModel.isReady = true;
    testnetStatus.getTestnetStatus(statusModel).then(function(data) {
      should(data).be.ok;
      done();
    }, function(err) {
      should(err).not.be.ok;
      done();
    });
  });

  after(function(done) {
    db.db.dropDatabase();
    mongoose.disconnect();
    done();
  });
});
