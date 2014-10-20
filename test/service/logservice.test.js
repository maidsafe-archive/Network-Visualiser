var logService = require('../../backend/maidsafe/service/LogService');
var should = require('should');
var mock = require('../../ci/test/mock');
var serviceTestHelper = require('../../ci/test/ServiceTestHelper');
var serviceHelper = serviceTestHelper.helper;

describe('LogService', function() {
  var req;
  before(serviceHelper.connectToTestSession);

  after(function(done) {
    serviceHelper.closeAndDropDB();
    done();
  });

  it('SaveLog - Should be able to save vault log', function(compledCallback) {
    req = new mock.Request();
    req.body = {
      vaultId: 'aaa..bbb', actionId: 0, sessionId: serviceHelper.getSessionId(),
      ts: '2014-10-12T12:00:00.000Z', valueOne: 'dddd'
    };
    var assert = function(status) {
      should(status).equal(200);
     // compledCallback();
    };
    logService.saveLog(req, new mock.Response(compledCallback, assert));
  });
  it('SaveLog - Should be able to push log to queue for action id 0', function(done) {
    req = new mock.Request();
    req.body = {
      vaultId: 'aaa..bbb', actionId: 0, sessionId: serviceHelper.getSessionId(),
      ts: '2014-10-12T12:00:00.000Z', valueOne: {
        'in': 'sasd..asd',
        'out': 'asd..asd'
      }
    };
    var assert = function(status) {
      should(status).equal(200);
      done();
    };
    logService.saveLog(req, new mock.Response(done, assert));
  });
  it('SaveLog - Should be able to push log to queue for action id 18', function(done) {
    req = new mock.Request();
    req.body = {
      vaultId: 'aaa..bbb', actionId: 18, sessionId: serviceHelper.getSessionId(),
      ts: '2014-10-12T12:00:00.000Z', valueOne: {
        'in': 'sasd..asd',
        'out': 'asd..asd'
      }
    };
    var assert = function(status) {
      should(status).equal(200);
      done();
    };
    logService.saveLog(req, new mock.Response(done, assert));
  });
  it('SaveLog - Should be able to save Connection Map Actual log', function(done) {
    req = new mock.Request();
    req.body = {
      vaultId: 'aaa..bbb', actionId: 19, sessionId: serviceHelper.getSessionId(),
      ts: '2014-10-12T12:00:00.000Z', valueOne: {
        'in': 'sasd..asd',
        'out': 'asd..asd'
      }
    };
    var assert = function(status) {
      should(status).equal(200);
      done();
    };
    logService.saveLog(req, new mock.Response(done, assert));
  });
  it('SaveLog - Should be able to convert to JSON if valueOne of log is of String type', function(done) {
    req = new mock.Request();
    var valueOne = {
      in: 'sasd..asd',
      out: 'asd..asd'
    };
    req.body = {
      vaultId: 'aaa..bbb', actionId: 19, sessionId: serviceHelper.getSessionId(),
      ts: '2014-10-12T12:00:00.000Z', valueOne: JSON.stringify(valueOne)
    };
    var assert = function(status) {
      should(status).equal(200);
      done();
    };
    logService.saveLog(req, new mock.Response(done, assert));
  });
  it('SaveLog - Should be able to assert incoming log for errors', function(done) {
    req = new mock.Request();
    req.body = {
      vaultId: '', actionId: 19, sessionId: serviceHelper.getSessionId(),
      ts: '2014-10-12T12:00:00.000Z', valueOne: {
        'in': 'sasd..asd',
        'out': 'asd..asd'
      }
    };
    var assert = function(status) {
      should(status).not.equal(200);
      done();
    };
    logService.saveLog(req, new mock.Response(done, assert));
  });
});
