var bridge = require('./../mongo/bridge.js');
var socket = require('./../socket/Socket.js');
var fs = require('fs');
var path = require('path');

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
  exec('network_sanity_checker.exe', function(error){
    if (error) {
      console.error(error);
      setTimeout(checkStatus, timeoutDuration);
    }

    fs.readFile('results.json', 'utf8', function(err, data) {
      if (err) {
        console.error(err);
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
      bridge.updateTestnetStatus(newStatus).then(function() {
        socket.broadcastTestnetStatusUpdate(newStatus);
        setTimeout(checkStatus, timeoutDuration);
      }, function(err) {
        console.error(err);
        setTimeout(checkStatus, timeoutDuration);
      });
    });
  });
};

exports.register = function(server) {
  server.get('/backend/testnetStatus', getTestnetStatus);

  checkStatus();
};