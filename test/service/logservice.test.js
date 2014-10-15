var logService = require('../../backend/maidsafe/service/LogService');
var should = require('should');
var mock = require('../../ci/test/mock');
var serviceHelper = require('../../ci/test/ServiceTestHelper').helper;

describe('LogService', function() {

  before(serviceHelper.connectToTestSession);

  after(function(done) {
    serviceHelper.closeAndDropDB();
    done();
  });

  it('SaveLog - ', function(done){
    var req = new mock.Request();
    req.body = {
      vaultId: 'aaa..bbb', actionId: 0, sessionId: serviceHelper.getSessionId(),
      ts:'2014-10-12T12:00:00.000Z', valueOne: 'dddd'
    };
    var assert = function(status) {
      (status).should.equal(200);
      done();
    };
    logService.saveLog(req, new mock.Response(done, assert));
  });
});
