/*jshint expr: true*/

var should = require('should'); // jshint ignore:line
var bridge = require('../../backend/mongo/bridge');
var config = require('../../Config');
var testnetStatus = require('../../backend/mongo/TestnetStatus');

describe('Testnet Status', function() {
  var statusModel = {'last_updated': '', isReady: false};
  before(function(done) {
    bridge.setupMongooseConnection(done, (config.Constants.mongoCon + config.Constants.testDBEndPoint));
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
});
