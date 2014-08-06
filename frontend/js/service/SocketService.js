var SocketService = [
  '$rootScope', 'dataManager', function($rootScope, dataManager) {
    $rootScope.realTime = true;
    $rootScope.sessionName = '';

    var socket = io.connect($rootScope.socketEndPoint);

    var signalObserver;
    var testnetStatusObserver;

    socket.on('log', function(data) {
      if ($rootScope.realTime && data.session_name == $rootScope.sessionName) {
        setTimeout(function() {
          dataManager.pushLog(data);
        }, 1); //threaded so ui is non-blocking
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
    this.setSignalListner = function(callback) {
      signalObserver = callback;
    };
    this.setTestnetStatusListner = function(callback) {
      testnetStatusObserver = callback;
    };
  }
]