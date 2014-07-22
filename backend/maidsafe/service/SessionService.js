var bridge = require('./../../../backend/mongo/bridge.js');
var Handler = require('./Handler.js');
var utils = require('./../utils.js');
var url = require('url');
var fs = require('fs');

exports.createSession = function(req, res) {
  if (!req._userInfo || !req._userInfo.isAuthenticated) {
    res.send(500, 'Invalid Authentication');
    return;
  }

  var criteria = JSON.parse(JSON.stringify(req.body));
  if (!criteria || !criteria.hasOwnProperty('session_name')) {
    res.send(500, 'Invalid parameters');
    return;
  }

  bridge.createSession(criteria.session_name, req._userInfo.mailAddress, new Handler.CreateSessionHandler(res));
};

exports.importSession = function(req, res) {
  if (!req._userInfo || !req._userInfo.isAuthenticated) {
    res.send(500, 'Invalid Authentication');
    return;
  }

  fs.readFile(req.files.file.path, function(err, data) {
    var fileName = "Import_" + new Date().getTime() + '.csv';
    fs.writeFile(fileName, data, function(err) {
      if (err) {
        res.send(500, 'Invalid File');
        return;
      }

      bridge.importLogs(req.body.sn, req._userInfo.mailAddress, fileName).then(function() {
        var handler = new Handler.SaveLogHandler();
        res.send('Added to Import Queue');
        fs.unlinkSync(path);
        handler.refreshSessionsCallback();
      }, function() {
        fs.unlinkSync(path);
        res.send(500, 'Invalid File');
      });
    });
  });
};

exports.getCurrentSessions = function(req, res) {
  bridge.getCurrentSessions(req._userInfo).then(function(activeSessions) {
    if (!activeSessions.length) {
      res.send(500, "No Active Sessions");
      return;
    }
    res.send(activeSessions);
  });
};

exports.deleteSession = function(req, res) {
  if (!req._userInfo || !req._userInfo.isAuthenticated) {
    res.send(500, 'Invalid Authentication');
    return;
  }

  var criteria = url.parse(req.url, true).query;
  if (!criteria || utils.isEmptyObject(criteria) || !criteria.hasOwnProperty('sn')) {
    res.send(500, 'Invalid Request');
    return;
  }

  if (req._userInfo.isMaidSafeUser) {
    bridge.deleteSession(criteria.sn, new Handler.DeleteSessionHandler(res));
    return;
  }

  bridge.getSessionCreatedByForName(criteria.sn).then(function(createdBy) {
    if (createdBy == req._userInfo.mailAddress) {
      bridge.deleteSession(criteria.sn, new Handler.DeleteSessionHandler(res));
    } else {
      res.send(500, 'Invalid Authentication');
    }
  });
};

exports.deletePendingSession = function(req, res) {
  if (!req._userInfo || !req._userInfo.isAuthenticated) {
    res.send(500, 'Invalid Authentication');
    return;
  }

  var criteria = url.parse(req.url, true).query;
  if (!criteria || utils.isEmptyObject(criteria) || !criteria.hasOwnProperty('sn')) {
    res.send(500, 'Invalid Request');
    return;
  }

  if (req._userInfo.isMaidSafeUser) {
    bridge.deletePendingSession(criteria.sn, new Handler.DeleteSessionHandler(res));
    return;
  }

  bridge.getSessionCreatedByForName(criteria.sn).then(function(createdBy) {
    if (createdBy == req._userInfo.mailAddress) {
      bridge.deletePendingSession(criteria.sn, new Handler.DeleteSessionHandler(res));
    } else {
      res.send(500, 'Invalid Authentication');
    }
  });
};