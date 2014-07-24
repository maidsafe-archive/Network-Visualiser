var sessionService = require('./service/SessionService.js');
var utils = require('./utils.js');
var userAuth = require('./../auth/UserAuth.js');

var createSession = function(req, res) {
  sessionService.createSession(req, res);
};
var importSession = function(req, res) {
  sessionService.importSession(req, res);
};
var getCurrentSessions = function(req, res) {
  sessionService.getCurrentSessions(req, res);
};
var deleteActiveSession = function(req, res) {
  sessionService.deleteActiveSession(req, res);
};
var deletePendingSession = function(req, res) {
  sessionService.deletePendingSession(req, res);
};
exports.register = function(server) {
  server.post('/backend/createSession', userAuth.appendUserInfo, createSession);
  server.post('/backend/import', userAuth.appendUserInfo, importSession);

  server.get('/backend/currentSessions', userAuth.appendUserInfo, getCurrentSessions);
  server.get('/backend/deleteActiveSession', userAuth.appendUserInfo, deleteActiveSession);
  server.get('/backend/deletePendingSession', userAuth.appendUserInfo, deletePendingSession);
};