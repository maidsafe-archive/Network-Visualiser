/**
 * Created by krishnakumarp on 29-09-2014.
 */

var app = angular.module('MaidSafe', ['ngReact']);

app.controller('connectionMapCtrl', ['$scope', '$location', function ($scope, $location) {
    $scope.sessionName = $location.search().sn;
    $scope.iconsTrayClosed = true;
    $scope.currentTime = new Date();
    $scope.vaultsCount = 10;


    $scope.connections = [
      {
        "name": "Vault-A",
        "group": [
          "Vault-B",
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
      },
      {
        "name": "Vault-K",
        "group": [
          "Vault-B",
          "Vault-A",
          "Vault-G"
        ],
        "expected" : [
          "Vault-B",
          "Vault-C",
          "Vault-O"
        ],
        "lastIn": "Vault-A",
        "lastOut": "Vault-C"
      }
    ];
  $scope.toggleIconsTray = function () {
        $scope.iconsTrayClosed = !$scope.iconsTrayClosed;
    };
  var reactComp;
  $scope.registerReactComponent = function(reactComponent) {
    reactComp = reactComponent;
    setTimeout(function(){
      $scope.connections = $scope.connections.slice(1);
      reactComp.setState({});
    }, 6000)
  };


}]);
