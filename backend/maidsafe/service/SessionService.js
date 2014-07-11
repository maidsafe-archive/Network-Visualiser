var bridge = require('./../../../backend/mongo/bridge.js');
var Handler = require('./Handler.js');
var utils = require('./../utils.js');

exports.createSession = function(req, res) {
  var criteria = JSON.parse(JSON.stringify(req.body));
  if (!criteria || !criteria.hasOwnProperty('session_name')) {
    res.send(500, 'Invalid parameters');
    return;
  }

  bridge.createSession(criteria.session_name, new Handler.CreateSessionHandler(res));
};

exports.getCurrentActiveSessions = function(req, res) {
  bridge.getCurrentActiveSessions().then(function(activeSessions) {
    if (!activeSessions.length) {
      res.send(500, "No Active Sessions");
      return;
    }
    res.send(activeSessions);
  });
};