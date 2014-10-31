/* global window:false */
window.ConnectionMapSocketService = [
  '$rootScope', '$timeout', 'connectionMapStatus',
  function($rootScope, $timeout, connectionStatus) {
    var instance = this;
    var socket = window.io.connect($rootScope.socketEndPoint, {
      transports: [ 'websocket', 'xhr-polling' ]
    });
    socket.on('actual_conn', function(data) {
      $timeout(function() {
        connectionStatus.updateActual(data);
      }, 1);
    });
    socket.on('expected_conn', function(data) {
      $timeout(function() {
        connectionStatus.updateExpected(data);
      }, 1);
    });
    instance.connectToChannel = function(sessionName) {
      socket.emit('channel', sessionName);
    };
  }
];
