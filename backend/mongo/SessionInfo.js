var mongoose = require('mongoose');
var utils = require('./../maidsafe/utils.js');

var SessionMetaData = function(dbConnection) {
  var SCHEMA, SessionInfo, MODEL_NAME;
  SCHEMA = {
    session_id: String,
    session_name: String,
    is_active: Boolean
  };
  MODEL_NAME = 'sessionInfo';
  SessionInfo = mongoose.model(MODEL_NAME, new mongoose.Schema(SCHEMA), MODEL_NAME);
  utils.ensureUniqueDocInMongo(dbConnection, MODEL_NAME, 'session_id');

  var isDuplicateSessionId = function(sessionId, sessions) {
    for (var index in sessions) {
      if (sessions[index].session_id == sessionId) {
        return true;
      }
    }
    return false;
  };
  var isDuplicateSessionName = function(sessionName, sessions) {
    for (var index in sessions) {
      if (sessions[index].session_name == sessionName) {
        return true;
      }
    }
    return false;
  };
  this.createSession = function(sessionName, callback) {
    var promise = new mongoose.Promise;
    if (callback) {
      promise.addBack(callback);
    }
    SessionInfo.find({}, { session_id: 1, session_name: 1 }, function(err, res) {
      if (err) {
        promise.error(err);
        return;
      }

      var nameTrimmed = sessionName;
      if (!nameTrimmed) {
        nameTrimmed = "Unknown Session";
      } else {
        nameTrimmed = nameTrimmed.trim();
      }

      var currentSessions = res;
      if (isDuplicateSessionName(nameTrimmed, currentSessions)) {
        promise.error('Duplicate Session Name');
        return;
      }

      var randomId;
      do {
        randomId = utils.generateRandomSessionIdString();
      } while (currentSessions.length > 0 && isDuplicateSessionId(randomId, currentSessions));


      var newSession = new SessionInfo({ session_id: randomId, session_name: nameTrimmed, is_active: false });
      newSession.save(function(errSave, resSave) {
        if (errSave) {
          promise.error(errSave);
          return;
        }
        promise.complete(randomId);
      });
    });
    return promise;
  };
  this.getCurrentActiveSessions = function(callback) {
    var promise = new mongoose.Promise;
    if (callback) {
      promise.addBack(callback);
    }
    SessionInfo.find({ is_active: true }, { session_id: 1, session_name: 1 }, function(err, res) {
      err ? promise.error(err) : promise.complete(res);
    });
    return promise;
  };
  this.clearPendingSessions = function(callback) {
    var promise = new mongoose.Promise;
    if (callback) {
      promise.addBack(callback);
    }

    SessionInfo.remove( { is_active : "false" }, function(err, res) {
      err ? promise.error(err) : promise.complete(res);
    });
    return promise;
  };
  return this;
};
exports.SessionMetaData = SessionMetaData;