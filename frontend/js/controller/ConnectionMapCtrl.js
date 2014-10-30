/* global window:false */

var app = window.angular.module('MaidSafe', []);
app.run([
  '$rootScope', '$location', function($rootScope, $location) {
    $rootScope.socketEndPoint = 'http://' + $location.host() + ':' + window.socketPort;
  }
]);
app.service('socketService', window.SocketService);
app.controller('connectionMapCtrl', [ '$scope', '$timeout', '$filter', function($scope, $timeout, $filter) {
  $scope.keyTrayClosed = false;
  $scope.currentTime = '';
  $scope.toggleKeyTray = function() {
    $scope.keyTrayClosed = !$scope.keyTrayClosed;
  };
  var clockTimer = function() {
    $scope.currentTime = $filter('date')(new Date(), 'dd/MM/yyyy HH:mm:ss');
    $timeout(clockTimer, 1000);
  };
  $timeout(function() {
    clockTimer();
  }, 10);
} ]);
