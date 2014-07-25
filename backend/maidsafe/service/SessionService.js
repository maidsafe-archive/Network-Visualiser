var bridge = require('./../../../backend/mongo/bridge.js');
var Handler = require('./Handler.js');
var utils = require('./../utils.js');
var url = require('url');
var fs = require('fs');
var archiver = require('archiver');

exports.createSession = function(req, res) {
  var criteria = JSON.parse(JSON.stringify(req.body));
  if (!criteria || !criteria.hasOwnProperty('session_name')) {
    res.send(500, 'Invalid parameters');
    return;
  }

  bridge.createSession(criteria.session_name, req._userInfo.mailAddress, new Handler.CreateSessionHandler(res));
};

exports.importSession = function(req, res) {
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
        fs.unlink(path);
        handler.refreshSessionsCallback();
      }, function() {
        fs.unlink(path);
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

exports.requestExport = function(req, res) {
  var criteria = url.parse(req.url, true).query;
  if (!criteria || !criteria.hasOwnProperty('sn')) {
    res.send(500, 'Missing Session Name');
    return;
  }

  bridge.exportLogs(criteria.sn).then(function(path) {
    var zipPath = path.replace(".csv", ".zip");
    var output = fs.createWriteStream(zipPath);
    var archive = archiver('zip');

    output.on('close', function() {
      fs.unlink(path);
      res.send(200, zipPath);
    });

    archive.on('error', function(err) {
      res.send(500, err);
    });

    archive.pipe(output);
    archive.append(fs.createReadStream(path), { name: criteria.sn + ' - Logs.csv' }).finalize();
  });
};

exports.downloadExport = function(req, res) {
  var criteria = url.parse(req.url, true).query;
  if (!criteria || !criteria.hasOwnProperty('sn') || !criteria.hasOwnProperty('fname')) {
    res.send(500, 'Missing File Name');
    return;
  }

  res.download(criteria.fname, criteria.sn + ' - Logs.zip', function() {
    fs.unlink(criteria.fname);
  });
};

exports.deleteActiveSession = function(req, res) {
  var criteria = url.parse(req.url, true).query;
  if (!criteria || utils.isEmptyObject(criteria) || !criteria.hasOwnProperty('sn')) {
    res.send(500, 'Invalid Request');
    return;
  }

  if (req._userInfo.isMaidSafeUser) {
    bridge.deleteActiveSession(criteria.sn, new Handler.DeleteSessionHandler(res));
    return;
  }

  bridge.getSessionCreatedByForName(criteria.sn).then(function(createdBy) {
    if (createdBy == req._userInfo.mailAddress) {
      bridge.deleteActiveSession(criteria.sn, new Handler.DeleteSessionHandler(res));
    } else {
      res.send(500, 'Invalid Authentication');
    }
  });
};

exports.deletePendingSession = function(req, res) {
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