var mongoose = require('mongoose');

var ActualConnection = function(dbCon) {
  var instance = this;
  var saveActualLog = function(sessionId, log) {

  };
  instance.save = saveActualLog;
  return instance;
};
module.exports = ActualConnection;