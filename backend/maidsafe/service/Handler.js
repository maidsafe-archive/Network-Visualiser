var socket = require('./../../socket/Socket.js');
var emitRefreshSessions = function() {
  socket.broadcastSignal('REFRESH_SESSIONS');
};
exports.SaveLogHandler = function(res) {
  this.res = res;
  var onLogSaved = function(data) {
    socket.broadcastLog(data);
    res.send('Saved');
  };
  var onDatabaseError = function(err) {
    res.send(500, err.message || err);
  };
  this.promise = function(err, data) {
    if (err) {
      onDatabaseError(err);
      return;
    }
    onLogSaved(data);
  };
  this.refreshSessionsCallback = function() {
    emitRefreshSessions();
  };
  return this;
};
exports.SelectLogsHandler = function(res) {
  this.res = res;
  var onComplete = function(data) {
    res.send(data);
  };
  var onDatabaseError = function(err) {
    res.send(500, err.message);
  };
  this.promise = function(err, data) {
    if (err) {
      onDatabaseError(err);
      return;
    }
    onComplete(data);
  };
  return this.promise;
};
exports.CreateSessionHandler = function(res) {
  this.res = res;
  var onSessionCreated = function(data) {
    emitRefreshSessions();
    res.send(data);
  };
  var onError = function(err) {
    res.send(500, err.message || err);
  };
  this.promise = function(err, data) {
    if (err) {
      onError(err);
      return;
    }
    onSessionCreated(data);
  };
  return this.promise;
};
exports.ClearActiveSessionHandler = function(res) {
  this.res = res;
  /* jshint unused:false */
  var onSessionCleared = function(data) {
    emitRefreshSessions();
    res.send('Session Cleared');
  };
  /* jshint unused:true */
  var onError = function(err) {
    res.send(500, err.message || err);
  };
  this.promise = function(err, data) {
    if (err) {
      onError(err);
      return;
    }
    onSessionCleared(data);
  };
  return this.promise;
};
exports.DeleteSessionHandler = function(res) {
  this.res = res;
  /* jshint unused:false */
  var onSessionDeleted = function(data) {
    emitRefreshSessions();
    res.send('Session Deleted');
  };
  /* jshint unused:true */
  var onError = function(err) {
    res.send(500, err.message || err);
  };
  this.promise = function(err, data) {
    if (err) {
      onError(err);
      return;
    }
    onSessionDeleted(data);
  };
  return this.promise;
};
exports.refreshSessions = emitRefreshSessions;
