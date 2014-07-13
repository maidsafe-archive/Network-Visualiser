var socket = require('./../../socket/Socket.js');
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
    exports.emitRefreshSessions();
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
    exports.emitRefreshSessions();
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
exports.ClearPendingSessionsHandler = function(res) {
  this.res = res;
  var onSessionsCleared = function(data) {
    exports.emitRefreshSessions();
    res.send('');
  };
  var onError = function(err) {
    res.send(500, err.message || err);
  };
  this.promise = function(err, data) {
    err ? onError(err) : onSessionsCleared(data);
  };
  return this.promise;
};
exports.DeleteSessionHandler = function(res) {
  this.res = res;
  var onSessionDeleted = function(data) {
    exports.emitRefreshSessions();
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
exports.emitRefreshSessions = function() {
  socket.broadcastSignal("REFRESH_SESSIONS");
};