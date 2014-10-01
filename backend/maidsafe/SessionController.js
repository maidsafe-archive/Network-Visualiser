var sessionService = require('./service/SessionService.js');
var userAuth = require('./../auth/UserAuth.js');
var validateAccess = function(req, res, next) {
  /* jscs:disable disallowDanglingUnderscores */
  if (!req._userInfo || !req._userInfo.isAuthenticated) {
    res.send(500, 'Invalid Authentication');
  } else {
    next();
  }
  /* jscs:enable disallowDanglingUnderscores */
};
var createSession = function(req, res) {
  sessionService.createSession(req, res);
};
var importSession = function(req, res) {
  sessionService.importSession(req, res);
};
var getCurrentSessions = function(req, res) {
  sessionService.getCurrentSessions(req, res);
};
var requestExport = function(req, res) {
  sessionService.requestExport(req, res);
};
var downloadExport = function(req, res) {
  sessionService.downloadExport(req, res);
};
var deleteActiveSession = function(req, res) {
  sessionService.deleteActiveSession(req, res);
};
var deletePendingSession = function(req, res) {
  sessionService.deletePendingSession(req, res);
};
var clearActiveSession = function(req, res) {
  sessionService.clearActiveSession(req, res);
};
exports.register = function(server) {
  server.post('/backend/createSession', userAuth.appendUserInfo, validateAccess, createSession);
  server.post('/backend/import', userAuth.appendUserInfo, validateAccess, importSession);
  server.get('/backend/currentSessions', userAuth.appendUserInfo, getCurrentSessions);
  server.get('/backend/requestExport', userAuth.appendUserInfo, validateAccess, requestExport);
  server.get('/backend/downloadExport', userAuth.appendUserInfo, validateAccess, downloadExport);
  server.get('/backend/deleteActiveSession', userAuth.appendUserInfo, validateAccess, deleteActiveSession);
  server.get('/backend/deletePendingSession', userAuth.appendUserInfo, validateAccess, deletePendingSession);
  server.get('/backend/clearActiveSession', userAuth.appendUserInfo, validateAccess, clearActiveSession);
};
