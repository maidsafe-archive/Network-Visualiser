var bridge = require('./../mongo/bridge.js');
var mapperObj;
var SessionMapper = function() {
  var instance = this;
  var map = {};
  var sessionNames = [];
  var getSessionIdForName = function(sessionName, callback) {
    bridge.getSessionIdForName(sessionName).then(function(sessionId) {
      callback(null, sessionId);
    }, callback);
  };
  var getSessionName = function(sessionId) {
    return map[sessionId];
  };
  var removeFromArray = function(value, array) {
    var index = array.indexOf(value);
    if (index < 0) {
      return array;
    }
    return array.slice(0, index).concat(array.slice(++index));
  };
  var remove = function(sessionId) {
    if (!sessionId || !getSessionName(sessionId)) {
      return;
    }
    removeFromArray(getSessionName(sessionId), sessionNames);
    delete map[sessionId];
  };
  var updateSessionId = function(sessionName, callback) {
    if (sessionNames.indexOf(sessionName) > -1) {
      callback(null);
      return;
    }
    getSessionIdForName(sessionName, function(err, sessionId) {
      if (err) {
        callback(err);
        return;
      }
      sessionNames.push(sessionName);
      map[sessionId] = sessionName;
      callback(null, sessionId);
    });
  };
  instance.getSessionName = getSessionName;
  instance.add = updateSessionId;
  instance.remove = remove;
};
mapperObj = new SessionMapper();
exports.add = mapperObj.add;
exports.getSessionName = mapperObj.getSessionName;
exports.remove = mapperObj.remove;
