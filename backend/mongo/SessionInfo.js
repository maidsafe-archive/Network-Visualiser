var mongoose = require('mongoose');
var utils = require('./../maidsafe/utils.js');
var SessionInfo;
var SCHEMA = {
  // jshint camelcase:false
  // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
  session_id: String,
  session_name: String,
  created_by: String,
  is_active: Boolean,
  beginDate: String,
  endDate: String
  // jshint camelcase:true
  // jscs:enable requireCamelCaseOrUpperCaseIdentifiers

};
var MODEL_NAME = 'sessionInfo';
SessionInfo = mongoose.model(MODEL_NAME, new mongoose.Schema(SCHEMA), MODEL_NAME);
var SessionMetaData = function(dbConnection) {
  utils.ensureUniqueDocInMongo(dbConnection, MODEL_NAME, 'session_id');
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
    SessionInfo.find({}, {session_id: 1, session_name: 1}, function(err, res) {
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
      var newSession = new SessionInfo({session_id: randomId, session_name: nameTrimmed,
        created_by: createdBy, is_active: false});
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
    var fullResultsCriteria = {_id: 0, session_id: 1, session_name: 1, created_by: 1, is_active: 1};
    var restrictedResultsCriteria = {_id: 0, session_name: 1, created_by: 1, is_active: 1};
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
    SessionInfo.find({created_by: userInfo.mailAddress}, fullResultsCriteria, function(err, res) {
      if (err) {
        promise.error(err);
        return;
      }
      SessionInfo.find({created_by: {$ne: userInfo.mailAddress}}, restrictedResultsCriteria,
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
    SessionInfo.findOne({session_name: sessionName}, {_id: 0, session_id: 1}, function(err, res) {
      /* jscs:enable disallowDanglingUnderscores */
      if (err || !res) {
        promise.error('Invalid Session');
        return;
      }
      SessionInfo.remove({session_name: sessionName}, function(removeErr, removeRes) {
        if (removeErr || removeRes === 0) {
          promise.error(removeErr || 'Invalid Session');
          return;
        }
        promise.complete(res.session_id);
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
    var queryCriteria = {session_name: sessionName, is_active: true};
    var updateCriteria = {$set: {is_active: false}, $unset: {beginDate: 1, endDate: 1}};
    // jshint camelcase:true
    // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
    SessionInfo.findOneAndUpdate(queryCriteria, updateCriteria, function(err, session) {
      if (err || !session) {
        promise.error(err || 'Invalid Session');
      }
      // jshint camelcase:false
      // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
      promise.complete(session.session_id);
      // jshint camelcase:true
      // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
    });
    return promise;
  };
  this.isValidSessionId = function(log) {
    var promise = new mongoose.Promise();
    // jshint camelcase:false
    // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
    SessionInfo.findOne({session_id: log.session_id}, function(err, res) {
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
    SessionInfo.findOneAndUpdate({session_id: log.session_id}, {$set: {is_active: true}}, {new: false},
      // jshint camelcase:true
      // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
      function(err, currentSession) {
        if (err) {
          promise.error('Unable to Update Session');
          return;
        }
        // jshint camelcase:false
        // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
        if (!currentSession.is_active && refreshSessionsCallback) {
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
    SessionInfo.findOne({session_name: sessionName}, {_id: 0, beginDate: 1, endDate: 1}, function(err, res) {
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
    SessionInfo.findOne({session_name: sessionName}, {_id: 0, session_id: 1}, function(err, res) {
      /* jscs:enable disallowDanglingUnderscores */
      if (err || !res) {
        promise.error(err);
        return;
      }
      promise.complete(res.session_id);
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
    SessionInfo.findOne({session_id: sessionId}, {_id: 0, session_name: 1}, function(err, res) {
      /* jscs:enable disallowDanglingUnderscores */
      if (err || !res) {
        promise.error(err);
        return;
      }
      promise.complete(res.session_name);
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
    SessionInfo.findOne({session_name: sessionName}, {_id: 0, created_by: 1}, function(err, res) {
      /* jscs:enable disallowDanglingUnderscores */
      if (err || !res) {
        promise.error(err);
        return;
      }
      promise.complete(res.created_by);
    });
    // jshint camelcase:true
    // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
    return promise;
  };
  var isDuplicateSessionId = function(sessionId, sessions) {
    for (var index in sessions) {
      // jshint camelcase:false
      // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
      if (sessions[index].session_id === sessionId) {
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
      if (sessions[index].session_name === sessionName) {
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
    if ((log.action_id === 0 || log.action_id === 18) &&
      (currentBeginDate === null || currentBeginDate.getTime() > newDateTime)) {
      setDate(currentSession.session_id, true, newDate, promise);
    } else if (currentBeginDate != null && (currentEndDate === null || currentEndDate.getTime() < newDateTime)) {
      setDate(currentSession.session_id, false, newDate, promise);
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
    SessionInfo.update({session_id: sessionId}, {$set: obj}, function(err, res) {
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
