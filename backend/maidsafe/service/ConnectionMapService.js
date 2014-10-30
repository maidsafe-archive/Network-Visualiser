var bridge = require('./../../mongo/bridge');
var ConnectionMapService = function() {
  var instance = this;
  var Handler = function(max, callback) {
    var counter = 0;
    var instance = this;
    var complete = function() {
      counter++;
      if (counter === max) {
        callback();
      }
    };
    instance.complete = complete;
    return instance;
  };
  var getExpectedConnections = function(sessionId, timestamp, callback) {
    bridge.connectionMap.getExpectedConnections(sessionId, timestamp, function(err, data) {
      if (err) {
        callback('Error in getting Expected Result', null);
      }
      callback(null, data);
    });
  };
  var getActualConnections = function(sessionId, timestamp, callback) {
    bridge.connectionMap.getActualConnections(sessionId, timestamp, function(err, data) {
      if (err) {
        callback('Error in getting Actual Result : ' + err.message, null);
      }
      callback(null, data);
    });
  };
  var getExpectedConnectionsDiff = function(sessionId, minTime, maxTime, callback) {
    bridge.connectionMap.getExpectedConnectionsDiff(sessionId, minTime, maxTime, function(err, data) {
      if (err) {
        callback('Error in getting Expected Result with range : ' + err.message, null);
      }
      callback(null, data);
    });
  };
  var getActualConnectionsDiff = function(sessionId, minTime, maxTime, callback) {
    bridge.connectionMap.getActualConnectionsDiff (sessionId, minTime, maxTime, function(err, data) {
      if (err) {
        callback('Error in getting Actual Result with range : ' + err.message, null);
      }
      callback(null, data);
    });
  };
  var getSnapshot = function(sessionName, timestamp, callback) {
    timestamp = timestamp || new Date().toISOString();
    var expectedConnection;
    var actualConnection;
    var onComplete;
    onComplete = function() {
      callback(null, { actual: actualConnection, expected: expectedConnection });
    };
    var handler = new Handler(2, onComplete);
    var onExpectedData = function(err, conn) {
      if (!err) {
        expectedConnection = conn;
      }
      handler.complete();
    };
    var onActualData = function(err, conn) {
      if (!err) {
        actualConnection = conn;
      }
      handler.complete();
    };
    bridge.getSessionIdForName(sessionName).then(function(sessionId) {
      getExpectedConnections(sessionId, timestamp, onExpectedData);
      getActualConnections(sessionId, timestamp, onActualData);
    });
  };
  var connectionMapDiff = function(sessionName, minTime, maxTime, callback) {
    if (!minTime || !maxTime) {
      callback('Time range required', null);
      return;
    }
    var expectedConnection;
    var actualConnection;
    var onComplete;
    onComplete = function() {
      callback(null, { actual: actualConnection, expected: expectedConnection });
    };
    var handler = new Handler(2, onComplete);
    var onExpectedData = function(err, conn) {
      if (!err) {
        expectedConnection = conn;
      }
      handler.complete();
    };
    var onActualData = function(err, conn) {
      if (!err) {
        actualConnection = conn;
      }
      handler.complete();
    };
    bridge.getSessionIdForName(sessionName).then(function(sessionId) {
      getExpectedConnectionsDiff(sessionId, minTime, maxTime, onExpectedData);
      getActualConnectionsDiff(sessionId, minTime, maxTime, onActualData);
    });
  };
  instance.snapshot = getSnapshot;
  instance.connectionMapDiff = connectionMapDiff;
};
var service = new ConnectionMapService();
exports.snapshot = service.snapshot;
exports.connectionMapDiff = service.connectionMapDiff;
