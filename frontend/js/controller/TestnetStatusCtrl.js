var app = angular.module('MaidSafe', []);

app.run([
  '$rootScope', '$location', function($rootScope, $location) {
    $rootScope.socketEndPoint = "http://" + $location.host() + ":" + socketPort;
  }
]);

app.service('dataManager', DataManagerService);
app.service('socketService', SocketService);

app.controller('testnetStatusCtrl', [
  '$scope', '$http', 'socketService', function($scope, $http, socketService) {

    $scope.testnetStatus = {};

    socketService.setTestnetStatusListner(function(data) {
      $scope.testnetStatus = data;
      if (!$scope.$$phase) {
        $scope.$apply();
      }
    });

    $http.get('/backend/testnetStatus').then(function(res) {
      $scope.testnetStatus = res.data;
    }, function() {
      $scope.testnetStatus = {
        is_ready: false
      };
    });
  }
]);