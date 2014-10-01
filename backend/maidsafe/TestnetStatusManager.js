var nodeMailer = require('nodemailer');
var mongoose = require('mongoose');
var fs = require('fs');
var path = require('path');
var bridge = require('./../mongo/bridge.js');
var socket = require('./../socket/Socket.js');
var config = require('./../../Config.js');
var appName = /^win/.test(process.platform) ? 'network_sanity_checker.exe' : 'network_sanity_checker';
var resolvedSanityCheckerDir = path.resolve(config.Constants.projectRootDir, config.Constants.sanityCheckerDir);
var serverPort = config.Constants.serverPort;
var sanityCheckerPath = path.resolve(resolvedSanityCheckerDir, appName);
var checkerResultsPath = path.resolve(resolvedSanityCheckerDir, 'results.json');
var timeoutDuration = 600000; // 10 minutes
var transporter;
var mailOptions = {
  to: 'dev@maidsafe.net',
  text: 'View current status at: http://visualiser.maidsafe.net:' + serverPort + '/testnet-status',
  html: '<span>View current status at: <a href="http://visualiser.maidsafe.net:' + serverPort +
    '/testnet-status">Testnet Status</a></span></a>'
};
var sendMailNotification = function(newStatus) {
  var errorCount = 0;
  for (var index in newStatus.connections) {
    if (!newStatus.connections[index].canConnect) {
      errorCount++;
    }
  }
  if (errorCount === 0) {
    mailOptions.subject = '✔ All bootstrap nodes operational';
  } else if (errorCount === 1) {
    mailOptions.subject = '✘ Failure : 1 bootstrap node down';
  } else {
    mailOptions.subject = '✘ Failure : ' + errorCount + ' bootstrap nodes down';
  }
  transporter.sendMail(mailOptions, function(err) {
    if (err) {
      console.error(err);
    }
  });
};
var padString = function(inputString) {
  return inputString.length >= 3 ? inputString : new Array(3 - inputString.length + 1).join('0') + inputString;
};
var sortConnections = function(leftItem, rightItem) {
  var leftItemFormatted = leftItem.contact.split('.').map(padString).join('.');
  var rightItemFormatted = rightItem.contact.split('.').map(padString).join('.');
  return leftItemFormatted.localeCompare(rightItemFormatted);
};
var validateStatusChange = function(newStatus) {
  var promise = new mongoose.Promise();
  if (!transporter || serverPort === 9080) {
    promise.complete('');
    return promise;
  }
  bridge.getTestnetStatus().then(function(oldStatus) {
    var oldConnections = oldStatus.connections;
    var newConnections = newStatus.connections;
    oldConnections.sort(sortConnections);
    newConnections.sort(sortConnections);
    if (oldConnections.length !== newConnections.length) {
      promise.complete('');
      return promise;
    }
    for (var index = 0; index < oldConnections.length; ++index) {
      if (oldConnections[index].canConnect !== newConnections[index].canConnect &&
        oldConnections[index].contact === newConnections[index].contact) {
        sendMailNotification(newStatus);
        break;
      }
    }
    promise.complete('');
  }, function() {
    promise.complete('');
  });
  return promise;
};
var getTestnetStatus = function(req, res) {
  bridge.getTestnetStatus().then(function(data) {
    data.connections.sort(sortConnections);
    res.send(data);
  }, function(err) {
    res.send(500, err);
  });
};
var checkStatus = function() {
  var exec = require('child_process').execFile;
  var updateStatus = function(newStatus) {
    bridge.updateTestnetStatus(newStatus).then(function() {
      socket.broadcastTestnetStatusUpdate(newStatus);
      setTimeout(checkStatus, timeoutDuration);
    }, function() {
      setTimeout(checkStatus, timeoutDuration);
    });
  };
  exec(sanityCheckerPath, function(error) {
    if (error) {
      setTimeout(checkStatus, timeoutDuration);
      return;
    }
    fs.readFile(checkerResultsPath, 'utf8', function(err, data) {
      if (err) {
        setTimeout(checkStatus, timeoutDuration);
        return;
      }
      var parsedData = JSON.parse(data);
      if (!parsedData || !parsedData.hasOwnProperty('bootstrapConnectivityCheck')) {
        console.error('JSON parse failed for results.json');
        setTimeout(checkStatus, timeoutDuration);
        return;
      }
      var newStatus = {};
      newStatus.last_updated = new Date().toISOString();
      // jshint camelcase:false
      // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
      newStatus.connections = parsedData.bootstrapConnectivityCheck;
      // jshint camelcase:true
      // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
      newStatus.is_ready = false;
      // jshint camelcase:false
      // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
      for (var index in newStatus.connections) {
        if (newStatus.connections[index].canConnect) {
          // jshint camelcase:false
          // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
          newStatus.is_ready = true;
          // jshint camelcase:true
          // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
          break;
        }
      }
      validateStatusChange(newStatus).then(function() {
        updateStatus(newStatus);
      });
    });
  });
};

exports.startChecker = checkStatus;
exports.mailerInit = function(mailId, mailPass) {
  transporter = nodeMailer.createTransport({
    service: 'Gmail',
    auth: {
      user: mailId,
      pass: mailPass
    }
  });
  mailOptions.from = 'Testnet Status Monitor <' + mailId + '>';
};
exports.register = function(server) {
  server.get('/backend/testnetStatus', getTestnetStatus);
};
