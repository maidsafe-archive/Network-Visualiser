var bridge = require('./../../../backend/mongo/bridge.js');
var Handler = require('./Handler.js');
var utils = require('./../utils.js');
var url = require('url');

exports.createSession = function(req, res) {
  var criteria = JSON.parse(JSON.stringify(req.body));
  if (!criteria || !criteria.hasOwnProperty('session_name')) {
    res.send(500, 'Invalid parameters');
    return;
  }

  bridge.createSession(criteria.session_name, new Handler.CreateSessionHandler(res));
};

exports.getCurrentSessions = function(req, res) {
  bridge.getCurrentSessions().then(function(activeSessions) {
    if (!activeSessions.length) {
      res.send(500, "No Active Sessions");
      return;
    }
    res.send(activeSessions);
  });
};

exports.clearPendingSessions = function(req, res) {
  bridge.clearPendingSessions(new Handler.ClearPendingSessionsHandler(res));
};

exports.deleteSession = function(req, res) {
  var criteria = url.parse(req.url, true).query;
  if (!criteria || utils.isEmptyObject(criteria) || !criteria.hasOwnProperty('sn')) {
    res.send(500, 'Invalid Request');
    return;
  }

  bridge.deleteSession(criteria.sn, new Handler.DeleteSessionHandler(res));
};

exports.deletePendingSession = function(req, res) {
  var criteria = url.parse(req.url, true).query;
  if (!criteria || utils.isEmptyObject(criteria) || !criteria.hasOwnProperty('sn')) {
    res.send(500, 'Invalid Request');
    return;
  }

  bridge.deletePendingSession(criteria.sn, new Handler.DeleteSessionHandler(res));
};