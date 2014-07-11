var sessionService = require('./service/SessionService.js');
var utils = require('./utils.js');

var createSession = function(req, res) {
  sessionService.createSession(req, res);
};
var getCurrentActiveSessions = function(req, res) {
  sessionService.getCurrentActiveSessions(req, res);
};
exports.register = function(server) {
  server.post('/createSession', createSession);

  server.get('/currentActiveSessions', utils.ensureAuthenticated, getCurrentActiveSessions);
};