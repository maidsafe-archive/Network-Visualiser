/*jshint expr: true*/
/*jshint unused:false*/
/* jscs:disable maximumLineLength */
/* jshint maxlen:false */

var should = require('should');
var vaultInfo = require('../../../backend/mongo/VaultInfo');
var queue = require('../../../backend/maidsafe/service/QueueService');
var mock = require('../../../ci/test/mock');
var serviceTestHelper = require('../../../ci/test/ServiceTestHelper');
var serviceHelper = serviceTestHelper.helper;
var logService = require('../../../backend/maidsafe/service/LogService');
var bridge = require('../../../backend/mongo/bridge');

describe('Expected Connections', function() {
  var req;
  var vaultFullIds = [
    '52d36f6fdbe3e39c5084b0a4f7bb6c6287cad1b51c9bfe27f1adc2b7495050375dd6088dd8db8e7a6b2138bfa91aff85f830bb01d938f66cad24e154a8fb5fbe',
    'aaf03624abbd026673ef6682143a0ba7a4248629a28b2f3da957992e2ba8d13cf0d2b991531111d50367a8dfbb3da41977024c747505d6a16e3eaeeab641ad18',
    '49e16b4555f0a2f2efb20713447d45692de888b4f940392f8065c21a457c70f59e4efb68f533a899db24bccd904fc93519a5693d6af86352041af0673021a39f',
    'd2dab0ca8a47d9452c01ea9cb932e3500363abb7fabc04ab486c141590a8723bda84841827dab86ddd9964c1f79f35a2602e00259eedc9124dbbe0fb938ab78b',
    '6d6244ed2e40a6e0e1dcf794488a22b8ee4df9565a16cc0b621f1173473b3a703d8292badfa2bb75a7b918d311264510bd7598e6dfe89af84a182b59161e8c61'
  ];
  var mockCallback = function() {};

  before(serviceHelper.connectToTestSession);

  after(function(done) {
    serviceHelper.closeAndDropDB();
    done();
  });
  var populateStartLogs = function(sessionId, completed) {
    for (var index = 0; index < vaultFullIds.length; index++) {
      var log = {};
      log.sessionId = sessionId;
      log.actionId = 0;
      log.vaultId = vaultFullIds[index].substring(0, 6) + '..' +
        vaultFullIds[index].substring(vaultFullIds[index].length - 6);
      log.valueOne = vaultFullIds[index];
      log.ts = new Date().toISOString();
      req = new mock.Request();
      req.body = log;
      logService.saveLog(req,
        new mock.Response((index === (vaultFullIds.length - 1)) ? completed : mockCallback, mockCallback));
    }
  };

  it('compute expected connections - vaults starting', function(done) {
    var sessionId = serviceHelper.getSessionId();
    var flag = false;
    var assert = function(data) {
      should(data).be.ok;
      for (var i in data) {
        if (data[i]) {
          if (data[i].vaultId === vaultFullIds[vaultFullIds.length - 1]) {
            should(data[i].closestVaults).be.eql([
              '49e16b4555f0a2f2efb20713447d45692de888b4f940392f8065c21a457c70f59e4efb68f533a899db24bccd904fc93519a5693d6af86352041af0673021a39f',
              '52d36f6fdbe3e39c5084b0a4f7bb6c6287cad1b51c9bfe27f1adc2b7495050375dd6088dd8db8e7a6b2138bfa91aff85f830bb01d938f66cad24e154a8fb5fbe',
              'd2dab0ca8a47d9452c01ea9cb932e3500363abb7fabc04ab486c141590a8723bda84841827dab86ddd9964c1f79f35a2602e00259eedc9124dbbe0fb938ab78b',
              'aaf03624abbd026673ef6682143a0ba7a4248629a28b2f3da957992e2ba8d13cf0d2b991531111d50367a8dfbb3da41977024c747505d6a16e3eaeeab641ad18'
            ]);
          }
        }
      }
    };
    var getData = function(err) {
      if (flag) {
        return;
      }
      flag = true;
      setTimeout(function() {
        bridge.connectionMap.getExpectedConnections(sessionId, new Date().toISOString(), function(err, data) {
          assert(data);
          bridge.clearActiveSession(serviceHelper.getSessionName(), done);
        });
      }, 200);
    };
    populateStartLogs(sessionId, getData);
  });

  it('compute expected connections - vault exit ', function(done) {
    var sessionId = serviceHelper.getSessionId();
    var flag = false;
    var assert = function(data) {
      should(data).be.ok;
      for (var i in data) {
        if (data[i]) {
          if (data[i].vaultId === vaultFullIds[vaultFullIds.length - 2]) {
            should(data[i].closestVaults).be.eql([
              'aaf03624abbd026673ef6682143a0ba7a4248629a28b2f3da957992e2ba8d13cf0d2b991531111d50367a8dfbb3da41977024c747505d6a16e3eaeeab641ad18',
              '52d36f6fdbe3e39c5084b0a4f7bb6c6287cad1b51c9bfe27f1adc2b7495050375dd6088dd8db8e7a6b2138bfa91aff85f830bb01d938f66cad24e154a8fb5fbe',
              '49e16b4555f0a2f2efb20713447d45692de888b4f940392f8065c21a457c70f59e4efb68f533a899db24bccd904fc93519a5693d6af86352041af0673021a39f'
            ]);
          }
        }
      }
    };
    var validate = function() {
      if (flag) {
        return;
      }
      flag = true;
      bridge.connectionMap.getExpectedConnections(sessionId, new Date().toISOString(), function(err, data) {
        assert(data);
        bridge.clearActiveSession(serviceHelper.getSessionName(), done);
      });
    };
    populateStartLogs(sessionId, function(err) {
      var log = {};
      log.sessionId = sessionId;
      log.actionId = 18;
      log.vaultId = vaultFullIds[vaultFullIds.length - 1].substring(0, 6) + '..' +
        vaultFullIds[vaultFullIds.length - 1].substring(vaultFullIds[vaultFullIds.length - 1].length - 6);
      log.valueOne = vaultFullIds[vaultFullIds.length - 1];
      log.ts = new Date().toISOString();
      req = new mock.Request();
      req.body = log;
      logService.saveLog(req,
        new mock.Response(function(err, data) {
          setTimeout(validate, 500);
        }, mockCallback));
    });
  });
});
