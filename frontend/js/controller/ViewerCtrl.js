var app = angular.module('MaidSafe', ['ngReact']);

app.run([
  '$rootScope', '$location', function($rootScope, $location) {
    $rootScope.socketEndPoint = "http://" + $location.host() + ":" + socketPort;
  }
]);

app.directive('clipCopy', ClipCopy);
app.directive('tooltip', ToolTip);
app.service('dataManager', DataManagerService);
app.service('vaultBehaviour', VaultBehaviourService);
app.service('socketService', SocketService);
app.service('vaultManager', VaultManagerService);

app.controller('viewerCtrl', [
  '$scope', '$rootScope', '$location', '$timeout', '$filter', 'dataManager', 'socketService', 'vaultManager',
  function($scope, $rootScope, $location, $timeout, $filter, dataManager, socketService, vaultManager) {

    $rootScope.sessionName = $location.search().sn;
    $scope.vaultManager = vaultManager;
    $scope.allVaultsExpanded = false;
    $scope.iconsTrayClosed = true;
    $scope.showLoader = true;
    $scope.alert = null;
    $scope.currentTime = '';

    var clockTimer = function() {
      $scope.currentTime = $filter('date')(new Date(), 'dd/MM/yyyy HH:mm:ss');
      $timeout(clockTimer, 1000);
    };
    var onVaultsLoaded = function(time) {
      if ($scope.vaultManager.vaultCollection.length == 0) {
        $scope.setStatusAlert('No active vaults');
      }
    };

    $scope.timeline = function() {
      window.open('/timeline#?sn=' + $rootScope.sessionName, '_blank').focus();
    };
    $scope.search = function() {
      window.open('/search#?sn=' + $rootScope.sessionName, '_blank').focus();
    };
    $scope.setStatusAlert = function(msg) {
      $scope.alert = msg;
      $timeout(function() {
        $scope.alert = null;
      }, 5000);
    };
    $scope.toggleIconsTray = function() {
      $scope.iconsTrayClosed = !$scope.iconsTrayClosed;
    };
    $scope.toggleExpandAllLogs = function() {
      $scope.allVaultsExpanded = !$scope.allVaultsExpanded;
      vaultManager.expandAllVaultLogs($scope.allVaultsExpanded);
    };

    dataManager.onNewVault($scope.vaultManager.addVault);
    dataManager.onVaultsLoaded(onVaultsLoaded);
    $timeout(function() {
      clockTimer();
      dataManager.getActiveVaults();
    }, 10);
  }
]);