/* global window:false */

window.TimelineLayoutService = ['$rootScope', '$location', '$timeout', 'vaultManager',
  function($rootScope, $location, $timeout, vaultManager) {
    var instance = this;
    instance.bind = function($scope) {
      $rootScope.sessionName = $location.search().sn;
      $scope.zoomClass = 'large';
      $scope.allVaultsExpanded = false;
      $scope.iconsTrayClosed = true;
      $scope.showLoader = true;
      $scope.firstLogtime = null;
      $scope.alert = null;
      $scope.playerStatus = '';
      $scope.showLoader = false;
      $scope.changeZoomLevel = function(newZoomLevel) {
        if ($scope.zoomClass === newZoomLevel) {
          return;
        }
        $scope.zoomClass = newZoomLevel;
        $scope.vaultManager.refreshVaultCollection();
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
    };
  }
];
