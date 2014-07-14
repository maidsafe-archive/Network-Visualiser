var sessionService = require('./service/SessionService.js');
var utils = require('./utils.js');

var createSession = function(req, res) {
  sessionService.createSession(req, res);
};
var getCurrentSessions = function(req, res) {
  sessionService.getCurrentSessions(req, res);
};
var clearPendingSessions = function(req, res) {
  sessionService.clearPendingSessions(req, res);
};
var deleteSession = function(req, res) {
  sessionService.deleteSession(req, res);
};
var deletePendingSession = function(req, res) {
  sessionService.deletePendingSession(req, res);
};
exports.register = function(server) {
  server.post('/createSession', utils.ensureAuthenticated, createSession);

  server.get('/currentSessions', getCurrentSessions);
  server.get('/deleteSession', utils.ensureAuthenticated, deleteSession);
  server.get('/deletePendingSession', utils.ensureAuthenticated, deletePendingSession);
  server.get('/clearAllPendingSessions', utils.ensureAuthenticated, clearPendingSessions);
};