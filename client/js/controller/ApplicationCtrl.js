var ApplicationCtrl = [
  '$scope', '$rootScope', '$location', 'dataManager', 'socketService', function($scope, $rootScope, $location, dataManager, socketService) {
    $rootScope.sessionName = $location.search().sn;

    $scope.iconsTrayClosed = true;

    $scope.vaults = [];
    $scope.allVaultsExpanded = false;

    $scope.showLoader = true;
    $scope.alert = null;
    $scope.currentTime = new Date().getTime();
    setInterval(function() {
      $scope.currentTime += 1000;
      if (!$scope.$$phase) {
        $scope.$apply();
      }
    }, 1000);
    $scope.timeline = function() {
      window.open('/client/timeline#?sn=' + $rootScope.sessionName, '_blank').focus();
    };
    $scope.export = function() {
      window.open('/export?sn=' + $rootScope.sessionName, '_blank');
    };
    $scope.search = function() {
      window.open('/client/search#?sn=' + $rootScope.sessionName, '_blank').focus();
    };
    $scope.setStatusAlert = function(msg) {
      $scope.alert = msg;
      setTimeout(function() {
        $scope.alert = null;
        if (!$scope.$$phase) {
          $scope.$apply();
        }
      }, 5000);
    };

    var newVault = function(vault) {
      $scope.vaults.push(vault);
      if (!$scope.$$phase) {
        $scope.$apply();
      }
    };
    var onVaultsLoaded = function(time) {
      $scope.showLoader = false;
      if (!$scope.vaults || $scope.vaults.length == 0) {
        $scope.setStatusAlert('No active vaults');
      }
    };
    $scope.toggleIconsTray = function() {
      $scope.iconsTrayClosed = !$scope.iconsTrayClosed;
    };
    $scope.toggleExpandAllLogs = function() {
      $scope.allVaultsExpanded = !$scope.allVaultsExpanded;
      $rootScope.$broadcast('expandVault', $scope.allVaultsExpanded);
    };
    dataManager.onNewVault(newVault);
    dataManager.onVaultsLoaded(onVaultsLoaded);
    setTimeout(function() {
      dataManager.getActiveVaults();
    }, 10);

    $scope.limit = 30;
    $scope.loadMore = function() {
      console.log('called');
      $scope.limit += 20;
      console.log('New limit: ' + $scope.limit);
    };
  }
];