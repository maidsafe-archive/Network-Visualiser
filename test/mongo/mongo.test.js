/*jshint expr: true*/
var should = require('should'); // jshint ignore:line
var bridge = require('../../backend/mongo/bridge');
describe('MonogoDb', function() {
  it('Should throw error when failed to connect monogoDb', function(done) {
    var path = 'mongodb://local:8080/monogodb?connectTimeoutMS=1000';
    bridge.setupMongooseConnection(function(err) {
      (err).should.be.ok;
      done();
    }, path);
  });
});
