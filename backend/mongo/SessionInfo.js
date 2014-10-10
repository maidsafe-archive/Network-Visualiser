var mongoose = require('mongoose');
var utils = require('./../maidsafe/utils.js');
var SessionInfo;
var SCHEMA = {
  // jshint camelcase:false
  // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
  sessionId: String,
  sessionName: String,
  createdBy: String,
  isActive: Boolean,
  beginDate: String,
  endDate: String
  // jshint camelcase:true
  // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
};
var MODEL_NAME = 'sessionInfo';
SessionInfo = mongoose.model(MODEL_NAME, new mongoose.Schema(SCHEMA), MODEL_NAME);
var SessionMetaData = function(dbConnection) {
  utils.ensureUniqueDocInMongo(dbConnection, MODEL_NAME, 'sessionId');
  this.createSession = function(sessionName, createdBy, callback) {
    var promise = new mongoose.Promise();
    if (callback) {
      promise.addBack(callback);
    }
    if (!createdBy) {
      setTimeout(function() {
        promise.error('Created by parameter is missing');
      }, 10);
      return promise;
    }
    // jshint camelcase:false
    // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
    SessionInfo.find({}, { sessionId: 1, sessionName: 1 }, function(err, res) {
      // jshint camelcase:true
      // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
      if (err) {
        promise.error(err);
        return;
      }
      var nameTrimmed = sessionName;
      if (!nameTrimmed) {
        nameTrimmed = 'Unknown Session';
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
      // jshint camelcase:false
      // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
      var newSession = new SessionInfo({ sessionId: randomId, sessionName: nameTrimmed,
        createdBy: createdBy, isActive: false });
      // jshint camelcase:false
      // jscs:disable requireCamelCaseOrUpperCaseIdentifiers

      // jshint unused:false
      newSession.save(function(errSave, resSave) {
        if (errSave) {
          promise.error(errSave);
          return;
        }
        promise.complete(randomId);
      });
      // jscs unused:true
    });
    return promise;
  };
  this.getCurrentSessions = function(userInfo, callback) {
    var promise = new mongoose.Promise();
    if (callback) {
      promise.addBack(callback);
    }
    // jshint camelcase:false
    // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
    /* jscs:disable disallowDanglingUnderscores */
    var fullResultsCriteria = { _id: 0, sessionId: 1, sessionName: 1, createdBy: 1, isActive: 1 };
    var restrictedResultsCriteria = { _id: 0, sessionName: 1, createdBy: 1, isActive: 1 };
    /* jscs:enable disallowDanglingUnderscores */
    // jshint camelcase:true
    // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
    if (userInfo.isMaidSafeUser) {
      SessionInfo.find({}, fullResultsCriteria, function(err, res) {
        if (err) {
          promise.error(err);
          return;
        }
        promise.complete(res);
      });
      return promise;
    }
    if (!userInfo.isAuthenticated) {
      SessionInfo.find({}, restrictedResultsCriteria, function(err, res) {
        if (err) {
          promise.error(err);
          return;
        }
        promise.complete(res);
      });
      return promise;
    }
    // jshint camelcase:false
    // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
    SessionInfo.find({ createdBy: userInfo.mailAddress }, fullResultsCriteria, function(err, res) {
      if (err) {
        promise.error(err);
        return;
      }
      SessionInfo.find({ createdBy: { $ne: userInfo.mailAddress } }, restrictedResultsCriteria,
        function(errSpecific, selectSessions) {
          if (errSpecific) {
            promise.error(errSpecific);
            return;
          }
          for (var index in res) {
            if (res[index]) {
              selectSessions.push(res[index]);
            }
          }
          promise.complete(selectSessions);
        });
    });
    // jshint camelcase:true
    // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
    return promise;
  };
  this.deleteSession = function(sessionName, callback) {
    var promise = new mongoose.Promise();
    if (callback) {
      promise.addBack(callback);
    }
    // jshint camelcase:false
    // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
    /* jscs:disable disallowDanglingUnderscores */
    SessionInfo.findOne({ sessionName: sessionName }, { _id: 0, sessionId: 1 }, function(err, res) {
      /* jscs:enable disallowDanglingUnderscores */
      if (err || !res) {
        promise.error('Invalid Session');
        return;
      }
      SessionInfo.remove({ sessionName: sessionName }, function(removeErr, removeRes) {
        if (removeErr || removeRes === 0) {
          promise.error(removeErr || 'Invalid Session');
          return;
        }
        promise.complete(res.sessionId);
      });
    });
    // jshint camelcase:true
    // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
    return promise;
  };
  this.clearActiveSession = function(sessionName, callback) {
    var promise = new mongoose.Promise();
    if (callback) {
      promise.addBack(callback);
    }
    // jshint camelcase:false
    // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
    var queryCriteria = { sessionName: sessionName, isActive: true };
    var updateCriteria = { $set: { isActive: false }, $unset: { beginDate: 1, endDate: 1 } };
    // jshint camelcase:true
    // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
    SessionInfo.findOneAndUpdate(queryCriteria, updateCriteria, function(err, session) {
      if (err || !session) {
        promise.error(err || 'Invalid Session');
        return;
      }
      // jshint camelcase:false
      // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
      promise.complete(session.sessionId);
      // jshint camelcase:true
      // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
    });
    return promise;
  };
  this.isValidSessionId = function(log) {
    var promise = new mongoose.Promise();
    // jshint camelcase:false
    // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
    SessionInfo.findOne({ sessionId: log.sessionId }, function(err, res) {
      // jshint camelcase:true
      // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
      if (!res) {
        promise.complete(false);
      } else {
        if (err) {
          promise.error(err);
          return;
        }
        promise.complete(true);
      }
    });
    return promise;
  };
  this.updateSessionInfo = function(log, refreshSessionsCallback) {
    var promise = new mongoose.Promise();
    // jshint camelcase:false
    // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
    SessionInfo.findOneAndUpdate({ sessionId: log.sessionId }, { $set: { isActive: true } }, { new: false },
      // jshint camelcase:true
      // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
      function(err, currentSession) {
        if (err) {
          promise.error('Unable to Update Session');
          return;
        }
        // jshint camelcase:false
        // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
        if (!currentSession.isActive && refreshSessionsCallback) {
          // jshint camelcase:true
          // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
          refreshSessionsCallback();
        }
        checkAndUpdateDates(log, currentSession, promise);
      });
    return promise;
  };
  this.getTimelineDates = function(sessionName, callback) {
    var promise = new mongoose.Promise();
    if (callback) {
      promise.addBack(callback);
    }
    // jshint camelcase:false
    // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
    /* jscs:disable disallowDanglingUnderscores */
    SessionInfo.findOne({ sessionName: sessionName }, { _id: 0, beginDate: 1, endDate: 1 }, function(err, res) {
      /* jscs:enable disallowDanglingUnderscores */
      // jshint camelcase:true
      // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
      if (err || !res) {
        promise.error('No times recorded');
        return;
      }
      promise.complete(res);
    });
    return promise;
  };
  this.getSessionIdForName = function(sessionName) {
    var promise = new mongoose.Promise();
    // jshint camelcase:false
    // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
    /* jscs:disable disallowDanglingUnderscores */
    SessionInfo.findOne({ sessionName: sessionName }, { _id: 0, sessionId: 1 }, function(err, res) {
      /* jscs:enable disallowDanglingUnderscores */
      if (err || !res) {
        promise.error(err);
        return;
      }
      promise.complete(res.sessionId);
    });
    // jshint camelcase:true
    // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
    return promise;
  };
  this.getSessionNameForId = function(sessionId, callback) {
    var promise = new mongoose.Promise();
    if (callback) {
      promise.addBack(callback);
    }
    // jshint camelcase:false
    // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
    /* jscs:disable disallowDanglingUnderscores */
    SessionInfo.findOne({ sessionId: sessionId }, { _id: 0, sessionName: 1 }, function(err, res) {
      /* jscs:enable disallowDanglingUnderscores */
      if (err || !res) {
        promise.error(err);
        return;
      }
      promise.complete(res.sessionName);
    });
    // jshint camelcase:true
    // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
    return promise;
  };
  this.getSessionCreatedByForName = function(sessionName) {
    var promise = new mongoose.Promise();
    // jshint camelcase:false
    // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
    /* jscs:disable disallowDanglingUnderscores */
    SessionInfo.findOne({ sessionName: sessionName }, { _id: 0, createdBy: 1 }, function(err, res) {
      /* jscs:enable disallowDanglingUnderscores */
      if (err || !res) {
        promise.error(err);
        return;
      }
      promise.complete(res.createdBy);
    });
    // jshint camelcase:true
    // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
    return promise;
  };
  var isDuplicateSessionId = function(sessionId, sessions) {
    for (var index in sessions) {
      // jshint camelcase:false
      // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
      if (sessions[index].sessionId === sessionId) {
        // jshint camelcase:true
        // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
        return true;
      }
    }
    return false;
  };
  var isDuplicateSessionName = function(sessionName, sessions) {
    for (var index in sessions) {
      // jshint camelcase:false
      // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
      if (sessions[index].sessionName === sessionName) {
        // jshint camelcase:true
        // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
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
    // jshint camelcase:false
    // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
    if ((log.actionId === 0 || log.actionId === 18) &&
      (currentBeginDate === null || currentBeginDate.getTime() > newDateTime)) {
      setDate(currentSession.sessionId, true, newDate, promise);
    } else if (currentBeginDate != null && (currentEndDate === null || currentEndDate.getTime() < newDateTime)) {
      setDate(currentSession.sessionId, false, newDate, promise);
      // jshint camelcase:true
      // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
    } else {
      promise.complete('');
    }
  };
  var setDate = function(sessionId, isBeginDate, newDate, promise) {
    var obj = {};
    obj[isBeginDate ? 'beginDate' : 'endDate'] = newDate.toISOString();
    // jshint unused:false
    // jshint camelcase:false
    // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
    SessionInfo.update({ sessionId: sessionId }, { $set: obj }, function(err, res) {
      // jshint camelcase:true
      // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
      if (err) {
        promise.error(err);
      } else {
        promise.complete('');
      }
    });
    // jshint unused:true
  };
  return this;
};
exports.SessionMetaData = SessionMetaData;
