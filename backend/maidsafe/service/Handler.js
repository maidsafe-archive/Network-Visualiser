var socket = require('./../../socket/Socket.js');


var emitRefreshSessions = function() {
  socket.broadcastSignal("REFRESH_SESSIONS");
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
    err ? onDatabaseError(err) : onLogSaved(data);
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
    err ? onDatabaseError(err) : onComplete(data);
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
    err ? onError(err) : onSessionCreated(data);
  };
  return this.promise;
};
exports.ClearActiveSessionHandler = function(res) {
  this.res = res;
  var onSessionCleared = function(data) {
    emitRefreshSessions();
    res.send('Session Cleared');
  };
  var onError = function(err) {
    res.send(500, err.message || err);
  };
  this.promise = function(err, data) {
    err ? onError(err) : onSessionCleared(data);
  };
  return this.promise;
};
exports.DeleteSessionHandler = function(res) {
  this.res = res;
  var onSessionDeleted = function(data) {
    emitRefreshSessions();
    res.send('Session Deleted');
  };
  var onError = function(err) {
    res.send(500, err.message || err);
  };
  this.promise = function(err, data) {
    err ? onError(err) : onSessionDeleted(data);
  };
  return this.promise;
};
exports.refreshSessions = emitRefreshSessions;