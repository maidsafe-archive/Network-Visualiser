/*jshint expr: true*/
/*jshint unused:false*/

var should = require('should');
var serviceHelper = require('./../ci/test/ServiceTestHelper').helper;
var io = require('socket.io-client');
var socketServer = require('../backend/socket/Socket');
var config = require('./../Config');
var socketURL = 'http://localhost:' + config.Constants.socketPort;

var options = {
  'force new connection': true
};

var SocketClient = function() {
  var instance = this;
  var client = instance.io = io.connect(socketURL, options);
  instance.disconnect = function() {
    client.disconnect();
  };
  return instance;
};
describe('Socket Server', function() {
  before(serviceHelper.connectToTestSession);

  after(function(done) {
    serviceHelper.deleteTestSession(function() {
      serviceHelper.closeAndDropDB();
      done();
    });
  });
  it('should be able to broadcast log message and receive it', function(done) {
    var data = {
      'sessionId': serviceHelper.getSessionId(),
      'actionId': 1, vaultId: 'aaa.asss',
      ts: '2014-10-12T12:00:00.000Z', valueOne: 'dddd'
    };
    var client = new SocketClient();
    client.io.on('log', function(data) {
      data.should.be.ok;
      data.should.be.exactly(data);
      client.disconnect();
      done();
    });
    client.io.on('ready', function() {
      socketServer.broadcastLog(data);
    });
    var sessionName = serviceHelper.getSessionName();
    client.io.emit('channel', sessionName);
  });

  it('should be able to broadcast signal and receive it', function(done) {
    var data = 'DATABASE_CLEARED';
    var client = new SocketClient();
    client.io.on('signal', function(data) {
      data.should.be.ok;
      data.should.be.exactly(data);
      client.disconnect();
      done();
    });
    client.io.on('ready', function() {
      socketServer.broadcastSignal(data);
    });
    var sessionName = serviceHelper.getSessionName();
    client.io.emit('channel', sessionName);
  });

  it('should be able to broadcast Actual log and receive it', function(done) {
    var data = {
      sessionName: serviceHelper.getSessionName(),
      'sessionId': serviceHelper.getSessionId(),
      'actionId': 18,
      vaultId: 'aaa.asss',
      ts: '2014-10-12T12:00:00.000Z', valueOne: {
        vaultAdded: 'sasd..asd',
        vaultRemoved: 'asd..asd'
      }
    };
    var client = new SocketClient();
    client.io.on('actual_conn', function(data) {
      data.should.be.ok;
      data.should.be.exactly(data);
      client.disconnect();
      done();
    });
    client.io.on('ready', function() {
      socketServer.broadcastActualConnection(data);
    });
    var sessionName = serviceHelper.getSessionName();
    client.io.emit('channel', sessionName);
  });

  it('should be able to broadcast Expected log and receive it', function(done) {
    var data = {
      sessionName: serviceHelper.getSessionName(),
      'sessionId': serviceHelper.getSessionId(),
      'actionId': 18,
      vaultId: 'aaa.asss'
    };
    var client = new SocketClient();
    client.io.on('expected_conn', function(data) {
      data.should.be.ok;
      data.should.be.exactly(data);
      client.disconnect();
      done();
    });
    client.io.on('ready', function() {
      socketServer.broadcastExpectedConnectionDiff(data);
    });
    var sessionName = serviceHelper.getSessionName();
    client.io.emit('channel', sessionName);
  });

  it('should be able to broadcast TestnetStatus and receive it', function(done) {
    var data = {
      sessionName: serviceHelper.getSessionName(),
      'sessionId': serviceHelper.getSessionId(),
      'actionId': 18,
      vaultId: 'aaa.asss'
    };
    var client = new SocketClient();
    client.io.on('testnet_status_update', function(data) {
      data.should.be.ok;
      data.should.be.exactly(data);
      client.disconnect();
      done();
    });
    client.io.on('ready', function() {
      socketServer.broadcastTestnetStatusUpdate(data);
    });
    var sessionName = serviceHelper.getSessionName();
    client.io.emit('channel', sessionName);
  });
});
