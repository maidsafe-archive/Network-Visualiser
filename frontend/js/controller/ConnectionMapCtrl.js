/**
 * Created by krishnakumarp on 29-09-2014.
 */

var app = angular.module('MaidSafe', ['ngReact']);
app.controller('connectionMapCtrl', ['$scope', '$location', function ($scope, $location) {
  $scope.sessionName = $location.search().sn;
  $scope.iconsTrayClosed = true;
  $scope.currentTime = new Date();
  $scope.vaultsCount = 10;
  $scope.counter = 0;
  $scope.connections = [];
  $scope.toggleIconsTray = function () {
    $scope.iconsTrayClosed = !$scope.iconsTrayClosed;
  };
  var reactComp;
  $scope.registerReactComponent = function (reactComponent) {
    reactComp = reactComponent;
    setInterval(function () {
      $scope.connections.push(
        {
          "name": ("Vault-A" + $scope.counter),
          "group": [
            ("Vault-B" + $scope.counter),
            "Vault-C",
            "Vault-K",
            "Vault-Y",
            "Vault-ZZ"
          ],
          "expected": [
            "Vault-B",
            "Vault-C",
            "Vault-G",
            "Vault-Y"
          ],
          "lastIn": "Vault-ZZ",
          "lastOut": "Vault-Y"
        });
      $scope.counter++;
      reactComp.setState({});
      console.log(($scope.counter * 2) + 6);
    }, 2000)
  };
}]);
