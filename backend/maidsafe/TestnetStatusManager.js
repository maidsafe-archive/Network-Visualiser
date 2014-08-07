var bridge = require('./../mongo/bridge.js');
var socket = require('./../socket/Socket.js');
var config = require('./../../Config.js');
var fs = require('fs');
var path = require('path');
var nodemailer = require('nodemailer');

var appName = /^win/.test(process.platform) ? 'network_sanity_checker.exe' : 'network_sanity_checker';
var resolvedSanityCheckerDir = path.resolve(config.Constants.projectRootDir, config.Constants.sanityCheckerDir);
var serverPort = config.Constants.serverPort;

var sanityCheckerPath = path.resolve(resolvedSanityCheckerDir, appName);
var checkerResultsPath = path.resolve(resolvedSanityCheckerDir, 'results.json');
var timeoutDuration = 300000; // 5 minutes

var transporter;
var mailOptions = {
  to: 'dev@maidsafe.net',
  text: 'View current status at: http://visualiser.maidsafe.net:' + serverPort + '/testnet-status',
  html: '<span>View current status at: <a href="http://visualiser.maidsafe.net:' + serverPort + '/testnet-status">Testnet Status</a></span></a>'
};

var getTestnetStatus = function(req, res) {
  bridge.getTestnetStatus().then(function(data) {
    res.send(data);
  }, function(err) {
    res.send(500, err);
  });
};

var checkStatus = function() {
  var exec = require('child_process').execFile;
  exec(sanityCheckerPath, function(error){
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
      newStatus.connections = parsedData.bootstrapConnectivityCheck;
      newStatus.is_ready = false;
      for(var index in newStatus.connections) {
        if (newStatus.connections[index].canConnect) {
          newStatus.is_ready = true;
          break;
        }
      }

      validateStatusChange(newStatus);
      updateStatus(newStatus);
    });
  });
};
var validateStatusChange = function(newStatus) {
  if (!transporter) {
    return;
  }

  bridge.getTestnetStatus().then(function(oldStatus) {
    var oldConnections = oldStatus.connections;
    var newConnections = newStatus.connections;
    oldConnections.sort(sortConnections);
    newConnections.sort(sortConnections);
    var errorCount = 0;

    if (oldConnections.length != newConnections.length) {
      sendMailNotification(newStatus);
      return;
    }

    for (var index in oldConnections) {
      if (oldConnections[index].contact != newConnections[index].contact ||
          oldConnections[index].canConnect != newConnections[index].canConnect) {
        errorCount++;
      }
    }

    if (errorCount != 0) {
      sendMailNotification(newStatus, errorCount);
    }
  });
};
var sendMailNotification = function(newStatus, errorCount) {
  mailOptions.subject = '✔ All bootstrap nodes operational';
  for(var index in newStatus.connections) {
    if (!newStatus.connections[index].canConnect) {
      mailOptions.subject = '✘ Failure : ' + (errorCount ? errorCount + ' bootstrap nodes down' : 'Nodes mismatch');
      break;
    }
  }

  transporter.sendMail(mailOptions, function(err){
    if(err){
      console.error(err);
    }
  });
};
var sortConnections = function(leftItem, rightItem) {
  return leftItem.contact.localeCompare(rightItem.contact);
};
var updateStatus = function(newStatus) {
  bridge.updateTestnetStatus(newStatus).then(function() {
    socket.broadcastTestnetStatusUpdate(newStatus);
    setTimeout(checkStatus, timeoutDuration);
  }, function() {
    setTimeout(checkStatus, timeoutDuration);
  });
};

exports.startChecker = checkStatus;

exports.mailerInit = function(mailId, mailPass) {
  transporter = nodemailer.createTransport({
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