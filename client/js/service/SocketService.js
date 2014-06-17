var SocketService = [
  '$rootScope', 'dataManager', function($rootScope, dataManager) {
    $rootScope.realTime = true;

    var socket = io.connect($rootScope.socketEndPoint);

    var signalObserver;
    socket.on('log', function(data) {
      if ($rootScope.realTime) {
        setTimeout(function() { dataManager.pushLog(data); }, 1); //threaded so ui is non-blocking
      }
    });

    socket.on('signal', function(data) {
      if (signalObserver)
        signalObserver(data);
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
  }
]