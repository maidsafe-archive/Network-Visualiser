/*jshint expr: true*/
var logService = require('../../backend/maidsafe/service/LogService');
var connectionMapService = require('../../backend/maidsafe/service/ConnectionMapService');
var should = require('should');
var mock = require('../../ci/test/mock');
var serviceTestHelper = require('../../ci/test/ServiceTestHelper');
var serviceHelper = serviceTestHelper.helper;

var Handler = function(done) {
  var flag = false;
  var completed = function(err) {
    if (flag) {
      return;
    }
    flag = true;
    done(err);
  };
  return completed;
};

describe('LogService', function() {
  var req;
  before(serviceHelper.connectToTestSession);

  after(function(done) {
    serviceHelper.closeAndDropDB();
    done();
  });

  it('SaveLog - Should be able to save vault log', function(done) {
    req = new mock.Request();
    req.body = {
      vaultId: 'aaa..bbb', actionId: 0, sessionId: serviceHelper.getSessionId(),
      ts: '2014-10-12T12:00:00.000Z', valueOne: 'dddd'
    };
    var assert = function(status) {
      should(status).equal(200);
    };
    logService.saveLog(req, new mock.Response(new Handler(done), assert));
  });
  it('SaveLog - Should be able to push log to queue for action id 0', function(done) {
    req = new mock.Request();
    req.body = {
      vaultId: 'aaa..bbb', actionId: 0, sessionId: serviceHelper.getSessionId(),
      ts: '2014-10-12T12:00:00.000Z', valueOne: {
        vaultAdded: 'sasd..asd',
        vaultRemoved: 'asd..asd'
      }
    };
    var assert = function(status) {
      should(status).equal(200);
    };
    logService.saveLog(req, new mock.Response(new Handler(done), assert));
  });
  it('SaveLog - Should be able to push log to queue for action id 18', function(done) {
    req = new mock.Request();
    req.body = {
      vaultId: 'aaa..bbb', actionId: 18, sessionId: serviceHelper.getSessionId(),
      ts: '2014-10-12T12:00:00.000Z', valueOne: {
        vaultAdded: 'sasd..asd',
        vaultRemoved: 'asd..asd'
      }
    };
    var assert = function(status) {
      should(status).equal(200);
    };
    logService.saveLog(req, new mock.Response(new Handler(done), assert));
  });
  it('SaveLog - Should be able to save Connection Map Actual log', function(done) {
    req = new mock.Request();
    req.body = {
      vaultId: 'aaa..bbb', actionId: 19, sessionId: serviceHelper.getSessionId(),
      ts: '2014-10-12T12:00:00.000Z', valueOne: {
        vaultAdded: 'sasd..asd',
        vaultRemoved: ''
      }
    };
    var assert = function(status) {
      should(status).equal(200);
    };
    logService.saveLog(req, new mock.Response(done, assert));
  });
  it('SaveLog - Should throw validation error for Connection Map Actual log', function(done) {
    req = new mock.Request();
    req.body = {
      vaultId: 'aaa..bbb', actionId: 19, sessionId: serviceHelper.getSessionId(),
      ts: '2014-10-12T12:00:00.000Z', valueOne: {
        vaultAdded: '',
        vaultRemoved: ''
      }
    };
    var assert = function(status) {
      should(status).not.equal(200);
    };
    logService.saveLog(req, new mock.Response(done, assert));
  });
  it('SaveLog - Should throw validation error for Connection Map Actual log if valueOne is not present',
    function(done) {
      req = new mock.Request();
      req.body = {
        vaultId: 'aaa..bbb', actionId: 19, sessionId: serviceHelper.getSessionId(),
        ts: '2014-10-12T12:00:00.000Z'
      };
      var assert = function(status) {
        should(status).not.equal(200);
      };
      logService.saveLog(req, new mock.Response(done, assert));
    }
  );
  it('SaveLog - Should throw validation error for Connection Map Actual log if valueAdded is not a String',
    function(done) {
      req = new mock.Request();
      req.body = {
        vaultId: 'aaa..bbb', actionId: 19, sessionId: serviceHelper.getSessionId(),
        ts: '2014-10-12T12:00:00.000Z', valueOne: {
          vaultAdded: 809909,
          vaultRemoved: ''
        }
      };
      var assert = function(status) {
        should(status).not.equal(200);
      };
      logService.saveLog(req, new mock.Response(done, assert));
    }
  );
  it('SaveLog - Should throw validation error for Connection Map Actual log if valueRemoved is not a String',
    function(done) {
      req = new mock.Request();
      req.body = {
        vaultId: 'aaa..bbb', actionId: 19, sessionId: serviceHelper.getSessionId(),
        ts: '2014-10-12T12:00:00.000Z', valueOne: {
          vaultAdded: '',
          vaultRemoved: 809909
        }
      };
      var assert = function(status) {
        should(status).not.equal(200);
      };
      logService.saveLog(req, new mock.Response(done, assert));
    }
  );
  it('SaveLog - Should throw validation error for Connection Map Actual log if closeGroupVaults is not a Object',
    function(done) {
      req = new mock.Request();
      req.body = {
        vaultId: 'aaa..bbb', actionId: 19, sessionId: serviceHelper.getSessionId(),
        ts: '2014-10-12T12:00:00.000Z', valueOne: {
          vaultAdded: 809909,
          vaultRemoved: '',
          closeGroupVaults: ''
        }
      };
      var assert = function(status) {
        should(status).not.equal(200);
      };
      logService.saveLog(req, new mock.Response(done, assert));
    }
  );
  it('SaveLog - Should be able to convert to JSON if valueOne of log is of String type', function(done) {
    req = new mock.Request();
    var valueOne = {
      vaultAdded: '',
      vaultRemoved: 'asd..asd',
      closeGroupVaults: []
    };
    req.body = {
      vaultId: 'aaa..bbb', actionId: 19, sessionId: serviceHelper.getSessionId(),
      ts: '2014-10-12T12:00:00.000Z', valueOne: JSON.stringify(valueOne)
    };
    var assert = function(status) {
      should(status).equal(200);
    };
    logService.saveLog(req, new mock.Response(done, assert));
  });
  it('SaveLog - Should be able to assert incoming log for errors', function(done) {
    req = new mock.Request();
    req.body = {
      vaultId: '', actionId: 19, sessionId: serviceHelper.getSessionId(),
      ts: '2014-10-12T12:00:00.000Z', valueOne: {
        vaultAdded: 'sasd..asd',
        vaultRemoved: 'asd..asd'
      }
    };
    var assert = function(status) {
      should(status).not.equal(200);
    };
    logService.saveLog(req, new mock.Response(done, assert));
  });
  it('Should be able to get connection map snapshot', function(done) {
    var mockCallback = function() {
    };
    var logSaved = function() {
      connectionMapService.snapshot(
        serviceHelper.getSessionName(), '2014-10-12T12:00:00.000Z', function(err, data) {
          should(err).not.be.ok;
          should(data).be.ok;
          done();
        });
    };
    var addActualLog = function() {
      req = new mock.Request();
      req.body = {
        vaultId: '', actionId: 19, sessionId: serviceHelper.getSessionId(),
        ts: '2014-10-12T12:00:00.000Z', valueOne: {
          vaultAdded: 'sasd..asd',
          vaultRemoved: 'asd..asd'
        }
      };
      logService.saveLog(req, new mock.Response(logSaved, mockCallback));
    };
    var addStartLog = function() {
      req = new mock.Request();
      req.body = {
        vaultId: '', actionId: 19, sessionId: serviceHelper.getSessionId(),
        ts: '2014-10-12T12:00:00.000Z', valueOne: {
          vaultAdded: 'sasd..asd',
          vaultRemoved: 'asd..asd'
        }
      };
      logService.saveLog(req, new mock.Response(addActualLog, mockCallback));
    };
    addStartLog();
  });
  it('Should be able to get connection map diffs', function(done) {
    var mockCallback = function() {
    };
    var logSaved = function() {
      connectionMapService.connectionMapDiff (
        serviceHelper.getSessionName(), '2014-10-12T11:00:00.000Z', '2014-10-12T12:00:00.000Z', function(err, data) {
          should(err).not.be.ok;
          should(data).be.ok;
          done();
        }
      );
    };
    var addActualLog = function() {
      req = new mock.Request();
      req.body = {
        vaultId: '', actionId: 19, sessionId: serviceHelper.getSessionId(),
        ts: '2014-10-12T12:00:00.000Z', valueOne: {
          vaultAdded: 'sasd..asd',
          vaultRemoved: 'asd..asd'
        }
      };
      logService.saveLog(req, new mock.Response(logSaved, mockCallback));
    };
    var addStartLog = function() {
      req = new mock.Request();
      req.body = {
        vaultId: '', actionId: 19, sessionId: serviceHelper.getSessionId(),
        ts: '2014-10-12T12:00:00.000Z', valueOne: {
          vaultAdded: 'sasd..asd',
          vaultRemoved: 'asd..asd'
        }
      };
      logService.saveLog(req, new mock.Response(addActualLog, mockCallback));
    };
    addStartLog();
  });
});
