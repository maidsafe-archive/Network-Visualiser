var sessionService = require('./service/SessionService.js');
var utils = require('./utils.js');

var createSession = function(req, res) {
  sessionService.createSession(req, res);
};
var getCurrentActiveSessions = function(req, res) {
  sessionService.getCurrentActiveSessions(req, res);
};
var clearPendingSessions = function(req, res) {
  sessionService.clearPendingSessions(req, res);
};
exports.register = function(server) {
  server.post('/createSession', utils.ensureAuthenticated, createSession);

  server.get('/currentActiveSessions', getCurrentActiveSessions);
  server.get('/clearPendingSessions', utils.ensureAuthenticated, clearPendingSessions);
};