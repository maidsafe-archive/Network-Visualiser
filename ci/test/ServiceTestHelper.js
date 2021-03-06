var mongoose = require('mongoose');
var bridge = require('../../backend/mongo/bridge');
var config = require('../../test/Config');

var Helper = function() {
  var sessionId;
  var db;
  var instance = this;
  var SESSION_NAME = 'TestSession';
  var createSession = instance.createSession = function(callback) {
    bridge.createSession(SESSION_NAME, 'demo', function(err, data) {
      if (err) {
        callback(err);
        return;
      }
      sessionId = data;
      callback();
    });
  };
  instance.deleteTestSession = function(callback) {
    bridge.deleteActiveSession(SESSION_NAME, callback);
  };
  instance.getDB = function() {
    return db;
  };
  instance.closeAndDropDB = function() {
    if (!db) {
      throw 'Database not initialized';
    }
    db.dropDatabase();
    mongoose.disconnect();
  };
  instance.connectToTestSession = function(callback) {
    bridge.setupMongooseConnection(function() {
      db = mongoose.connection.db;
      createSession(callback);
    }, config.Constants.mongoCon);
  };
  instance.getSessionId = function() {
    return sessionId;
  };
  instance.getSessionName = function() {
    return SESSION_NAME;
  };
  return instance;
};
exports.helper = new Helper();
