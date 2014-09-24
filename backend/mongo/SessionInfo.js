var mongoose = require('mongoose');
var utils = require('./../maidsafe/utils.js');
var SCHEMA, SessionInfo, MODEL_NAME;
SCHEMA = {
    session_id: String,
    session_name: String,
    created_by: String,
    is_active: Boolean,
    beginDate: String,
    endDate: String
  };
MODEL_NAME = 'sessionInfo';
SessionInfo = mongoose.model(MODEL_NAME, new mongoose.Schema(SCHEMA), MODEL_NAME);
  
var SessionMetaData = function(dbConnection) {
  
  
  utils.ensureUniqueDocInMongo(dbConnection, MODEL_NAME, 'session_id');

  this.createSession = function(sessionName, createdBy, callback) {
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


      var newSession = new SessionInfo({ session_id: randomId, session_name: nameTrimmed, created_by: createdBy, is_active: false });
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
  this.getCurrentSessions = function(userInfo, callback) {
    var promise = new mongoose.Promise;
    if (callback) {
      promise.addBack(callback);
    }

    var fullResultsCriteria = { _id: 0, session_id: 1, session_name: 1, created_by: 1, is_active: 1 };
    var restrictedResultsCriteria = { _id: 0, session_name: 1, created_by: 1, is_active: 1 };

    if (userInfo.isMaidSafeUser) {
      SessionInfo.find({}, fullResultsCriteria, function(err, res) {
        err ? promise.error(err) : promise.complete(res);
      });
      return promise;
    }

    if (!userInfo.isAuthenticated) {
      SessionInfo.find({}, restrictedResultsCriteria, function(err, res) {
        err ? promise.error(err) : promise.complete(res);
      });
      return promise;
    }

    SessionInfo.find({ created_by: userInfo.mailAddress }, fullResultsCriteria, function(err, res) {
      if (err) {
        promise.error(err);
        return;
      }

      SessionInfo.find({ created_by: { $ne: userInfo.mailAddress } }, restrictedResultsCriteria, function(errSpecific, selectSessions) {
        if (errSpecific) {
          promise.error(errSpecific);
          return;
        }

        for (var index in res) {
          selectSessions.push(res[index]);
        }

        promise.complete(selectSessions);
      });
    });
    return promise;
  };
  this.deleteSession = function(sessionName, callback) {
    var promise = new mongoose.Promise;
    if (callback) {
      promise.addBack(callback);
    }
    SessionInfo.findOne({ session_name: sessionName }, { _id: 0, session_id: 1 }, function(err, res) {
      if (err || !res) {
        promise.error('Invalid Session');
        return;
      }

      SessionInfo.remove({ session_name: sessionName }, function(removeErr, removeRes) {
        removeErr || removeRes == 0 ? promise.error(removeErr || 'Invalid Session') : promise.complete(res.session_id);
      });
    });
    return promise;
  };
  this.clearActiveSession = function(sessionName, callback) {
    var promise = new mongoose.Promise;
    if (callback) {
      promise.addBack(callback);
    }

    var queryCriteria = { session_name: sessionName, is_active: true };
    var updateCriteria = { $set: { is_active: false }, $unset: { beginDate: 1, endDate: 1 } };
    SessionInfo.findOneAndUpdate(queryCriteria, updateCriteria, function(err, session) {
      err || !session ? promise.error(err || 'Invalid Session') : promise.complete(session.session_id);
    });
    return promise;
  };
  this.isValidSessionId = function(log) {
    var promise = new mongoose.Promise;

    SessionInfo.findOne({ session_id: log.session_id }, function(err, res) {
      if (!res) {
        promise.complete(false);
      } else {
        err ? promise.error(err) : promise.complete(true);
      }
    });
    return promise;
  };
  this.updateSessionInfo = function(log, refreshSessionsCallback) {
    var promise = new mongoose.Promise;
    SessionInfo.findOneAndUpdate({ session_id: log.session_id }, { $set: { is_active: true } }, { new: false }, function(err, currentSession) {
      if (err) {
        promise.error('Unable to Update Session');
        return;
      }

      if (!currentSession.is_active && refreshSessionsCallback) {
        refreshSessionsCallback();
      }

      checkAndUpdateDates(log, currentSession, promise);
    });
    return promise;
  };
  this.getTimelineDates = function(sessionName, callback) {
    var promise = new mongoose.Promise;
    if (callback) {
      promise.addBack(callback);
    }

    SessionInfo.findOne({ session_name: sessionName }, { _id: 0, beginDate: 1, endDate: 1 }, function(err, res) {
      err || !res ? promise.error('No times recorded') : promise.complete(res);
    });
    return promise;
  };
  this.getSessionIdForName = function(sessionName) {
    var promise = new mongoose.Promise;

    SessionInfo.findOne({ session_name: sessionName }, { _id: 0, session_id: 1 }, function(err, res) {
      err || !res ? promise.error(err) : promise.complete(res.session_id);
    });
    return promise;
  };
  this.getSessionNameForId = function(sessionId, callback) {
    var promise = new mongoose.Promise;
    if (callback) {
      promise.addBack(callback);
    }

    SessionInfo.findOne({ session_id: sessionId }, { _id: 0, session_name: 1 }, function(err, res) {
      err || !res ? promise.error(err) : promise.complete(res.session_name);
    });
    return promise;
  };
  this.getSessionCreatedByForName = function(sessionName) {
    var promise = new mongoose.Promise;

    SessionInfo.findOne({ session_name: sessionName }, { _id: 0, created_by: 1 }, function(err, res) {
      err || !res ? promise.error(err) : promise.complete(res.created_by);
    });
    return promise;
  };
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
  var checkAndUpdateDates = function(log, currentSession, promise) {
    var currentBeginDate = currentSession.beginDate ? new Date(currentSession.beginDate) : null;
    var currentEndDate = currentSession.endDate ? new Date(currentSession.endDate) : null;
    var newDate = new Date(log.ts);
    var newDateTime = newDate.getTime();

    if ((log.action_id == 0 || log.action_id == 18) && (currentBeginDate == null || currentBeginDate.getTime() > newDateTime)) {
      setDate(currentSession.session_id, true, newDate, promise);
    } else if (currentBeginDate != null && (currentEndDate == null || currentEndDate.getTime() < newDateTime)) {
      setDate(currentSession.session_id, false, newDate, promise);
    } else {
      promise.complete('');
    }
  };
  var setDate = function(sessionId, isBeginDate, newDate, promise) {
    var obj = {};
    obj[isBeginDate ? 'beginDate' : 'endDate'] = newDate.toISOString();
    SessionInfo.update({ session_id: sessionId }, { $set: obj }, function(err, res) {
      if (err) {
        promise.error(err);
      } else {
        promise.complete('');
      }
    });
  };
  return this;
};
exports.SessionMetaData = SessionMetaData;