var bridge = require('./../mongo/bridge.js');
var Handler = require('./service/Handler.js');

var ciNightlySessionName = 'CI Nightlies';
var lastReset = (new Date()).toDateString();
var timeoutDuration = 3600000; // 1 hour

var checkSession = function() {
  var currentDate = (new Date()).toDateString();
  if (lastReset == currentDate) {
    setTimeout(checkSession, timeoutDuration);
    return;
  }

  bridge.clearSession(ciNightlySessionName).then(function() {
    lastReset = currentDate;
    Handler.refreshSessions();
    setTimeout(checkSession, timeoutDuration);
  }, function() {
    setTimeout(checkSession, timeoutDuration);
  });
};

exports.startChecker = checkSession;