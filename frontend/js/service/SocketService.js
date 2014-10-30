/* global window:false */

window.SocketService = [
  '$rootScope', '$timeout', '$location', function($rootScope, $timeout, $location) {
    var logObserver;
    var signalObserver;
    var testnetStatusObserver;
    $rootScope.realTime = true;
    $rootScope.sessionName = '';
    var socket = window.io.connect($rootScope.socketEndPoint, {
      transports: [ 'websocket', 'xhr-polling' ]
    });
    socket.on('log', function(data) {
      if ($rootScope.realTime) {
        if (logObserver) {
          $timeout(function() {
            logObserver(data);
          }, 1);
        }
      }
    });
    socket.on('signal', function(data) {
      if (signalObserver) {
        signalObserver(data);
      }
    });
    socket.on('testnet_status_update', function(data) {
      if (testnetStatusObserver) {
        testnetStatusObserver(data);
      }
    });
    this.start = function() {
      $rootScope.realTime = true;
    };
    this.stop = function() {
      $rootScope.realTime = false;
    };
    this.setLogListener = function(callback) {
      logObserver = callback;
    };
    this.setSignalListener = function(callback) {
      signalObserver = callback;
    };
    this.setTestnetStatusListener = function(callback) {
      testnetStatusObserver = callback;
    };
    if ($location.search().sn) {
      socket.emit('channel', $location.search().sn);
    }
  }
];
