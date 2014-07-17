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
var deleteSession = function(req, res) {
  sessionService.deleteSession(req, res);
};
var deletePendingSession = function(req, res) {
  sessionService.deletePendingSession(req, res);
};
exports.register = function(server) {
  server.post('/createSession', userAuth.appendUserInfo, utils.ensureAuthenticated, createSession);
  server.post('/import', userAuth.appendUserInfo, utils.ensureAuthenticated, importSession);

  server.get('/currentSessions', userAuth.appendUserInfo, getCurrentSessions);
  server.get('/deleteSession', userAuth.appendUserInfo, utils.ensureAuthenticated, deleteSession);
  server.get('/deletePendingSession', userAuth.appendUserInfo, utils.ensureAuthenticated, deletePendingSession);
};