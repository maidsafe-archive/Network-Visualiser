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

  this.createSession = function(sessionName, callback) {
    var promise = new mongoose.Promise;
    if (callback) {
      promise.addBack(callback);
    }
    SessionInfo.find({ }, { session_id: 1 }, function(err, res) {
      if (err) {
        promise.error(err);
        console.log(err);
        return;
      }

      var currentSessions = res;
      var randomId;
      do {
        randomId = utils.generateRandomSessionIdString();
      } while (currentSessions.length > 0 && currentSessions.indexOf(randomId) > -1);
      console.log('Random Session Id: ' + randomId);

      var newSession = new SessionInfo({ 'session_id': randomId, 'session_name': sessionName, 'is_active': false });
      newSession.save(function(errSave, resSave) {
        if (errSave) {
          promise.error(errSave);
          return;
        }
        console.log(resSave);
        promise.complete(randomId);
      });
    });
    return promise;
  };
  return this;
};
exports.SessionMetaData = SessionMetaData;