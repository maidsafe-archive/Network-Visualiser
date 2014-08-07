var bridge = require('./../mongo/bridge.js');
var socket = require('./../socket/Socket.js');
var config = require('./../../Config.js');
var fs = require('fs');
var path = require('path');

var appName = /^win/.test(process.platform) ? 'network_sanity_checker.exe' : 'network_sanity_checker';
var resolvedSanityCheckerDir = path.resolve(config.Constants.projectRootDir, config.Constants.sanityCheckerDir);

var sanityCheckerPath = path.resolve(resolvedSanityCheckerDir, appName);
var checkerResultsPath = path.resolve(resolvedSanityCheckerDir, 'results.json');
var timeoutDuration = 600000; // 10 minutes

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
      bridge.updateTestnetStatus(newStatus, statusChangedCallback).then(function() {
        socket.broadcastTestnetStatusUpdate(newStatus);
        setTimeout(checkStatus, timeoutDuration);
      }, function() {
        setTimeout(checkStatus, timeoutDuration);
      });
    });
  });
};

var statusChangedCallback = function(isReady) {
  console.log(isReady);
};

exports.startChecker = checkStatus;

exports.register = function(server) {
  server.get('/backend/testnetStatus', getTestnetStatus);
};