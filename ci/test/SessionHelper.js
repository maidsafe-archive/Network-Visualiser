module.exports =  function(db) {
  var sessionInfoModel = require('../../backend/mongo/SessionInfo');
  var SESSION_NAME = 'test_session';
  var USER = 'test_user';
  var sessionId;

  var sessionInfo = sessionInfoModel.SessionMetaData(db);

  var createTestSession = function(callBack) {
    sessionInfo.createSession(SESSION_NAME, USER, function(err, data) {
      if (err) {
        callBack(err);
        return;
      }
      sessionId = data;
      callBack();
    });
  };

  var getCurrentSessionId = function() {
    return sessionId;
  };

  var getCurrentSessionName = function() {
    return SESSION_NAME;
  };

  var getCurrentSessionUser = function() {
    return USER;
  };

  var deleteSession = function(callBack) {
    sessionInfo.deleteSession(SESSION_NAME, function(err) {
      if (err) {
        callBack(err);
        return;
      }
      callBack();
    });
  };

  this.createTestSession = createTestSession;
  this.getSessionId = getCurrentSessionId;
  this.getSessionName = getCurrentSessionName;
  this.getSessionUser = getCurrentSessionUser;
  this.deleteSession = deleteSession;

  return this;
};
