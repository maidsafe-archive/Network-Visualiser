var bridge = require('./../../../backend/mongo/bridge.js');
var mongoose = require('mongoose');
var Handler = require('./Handler.js');
var utils = require('./../utils.js');
var url = require('url');
var fs = require('fs');
var archiver = require('archiver');
var path = require('path');
var config = require('./../../../Config.js');

var validateSessionOwner = function(req) {
  var promise = new mongoose.Promise;
  var criteria = url.parse(req.url, true).query;
  if (!criteria || utils.isEmptyObject(criteria) || !criteria.hasOwnProperty('sn')) {
    promise.error('Invalid Request');
    return promise;
  }

  if (req._userInfo.isMaidSafeUser) {
    promise.complete(criteria.sn);
    return promise;
  }

  bridge.getSessionCreatedByForName(criteria.sn).then(function(createdBy) {
    if (createdBy == req._userInfo.mailAddress) {
      promise.complete(criteria.sn);
    } else {
      promise.error('Invalid Authentication');
    }
  }, function() {
    promise.error('Session not found');
  });

  return promise;
};

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
    var filePath = path.resolve(config.Constants.projectRootDir, "Import_" + new Date().getTime() + '.csv');
    fs.writeFile(filePath, data, function(err) {
      if (err) {
        res.send(500, 'Invalid File');
        return;
      }

      bridge.importLogs(req.body.sn, req._userInfo.mailAddress, filePath).then(function() {
        var handler = new Handler.SaveLogHandler();
        res.send('Added to Import Queue');
        fs.unlink(filePath);
        handler.refreshSessionsCallback();
      }, function() {
        fs.unlink(filePath);
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

  bridge.exportLogs(criteria.sn).then(function(csvPath) {
    var zipPath = csvPath.replace(".csv", ".zip");
    var output = fs.createWriteStream(path.resolve(config.Constants.projectRootDir , zipPath));
    var archive = archiver('zip');

    output.on('close', function() {
      fs.unlink(csvPath);
      res.send(200, zipPath.replace(".zip", ""));
    });

    archive.on('error', function(err) {
      res.send(500, err);
    });

    archive.pipe(output);
    archive.append(fs.createReadStream(csvPath), { name: criteria.sn + ' - Logs.csv' }).finalize();
  });
};

exports.downloadExport = function(req, res) {
  var criteria = url.parse(req.url, true).query;
  if (!criteria || !criteria.hasOwnProperty('sn') || !criteria.hasOwnProperty('fname')) {
    res.send(500, 'Missing details');
    return;
  }

  var rootFolder = config.Constants.projectRootDir;
  var downloadFile = path.resolve(rootFolder, criteria.fname + '.zip');
  if (downloadFile.indexOf(rootFolder) != 0) {
    res.send(500, 'Invalid Request');
    return;
  }

  res.download(downloadFile, criteria.sn + ' - Logs.zip', function(err) {
    if (err) {
      res.send(500, 'Invalid Request');
      return;
    }

    fs.unlink(downloadFile);
  });
};

exports.deleteActiveSession = function(req, res) {
  validateSessionOwner(req).then(function(sessionName) {
    bridge.deleteActiveSession(sessionName, new Handler.DeleteSessionHandler(res));
  }, function(err) {
    res.send(500, err);
  });
};

exports.deletePendingSession = function(req, res) {
  validateSessionOwner(req).then(function(sessionName) {
    bridge.deletePendingSession(sessionName, new Handler.DeleteSessionHandler(res));
  }, function(err) {
    res.send(500, err);
  });
};

exports.clearActiveSession = function(req, res) {
  validateSessionOwner(req).then(function(sessionName) {
    bridge.clearActiveSession(sessionName, new Handler.ClearActiveSessionHandler(res));
  }, function(err) {
    res.send(500, err);
  });
};
