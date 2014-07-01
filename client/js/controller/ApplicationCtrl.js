var ApplicationCtrl = [
  '$scope', '$rootScope', 'dataManager', 'socketService', function($scope, $rootScope, dataManager, socketService) {

    $scope.iconsTrayClosed = true;

    $scope.vaults = [];
    $scope.allVaultsExpanded = false;

    $scope.showLoader = true;
    $scope.alert;
    $scope.currentTime = new Date().getTime();
    setInterval(function() {
      $scope.currentTime += 1000;
      if (!$scope.$$phase) {
        $scope.$apply();
      }
    }, 1000);
    $scope.timeline = function() {
      window.open('/client/timeline#?ts=' + new Date().toISOString(), '_blank').focus();
    };
    $scope.export = function() {
      window.open('/export', '_blank');
    };
    $scope.import = function() {
      window.open("/client/template/import.html", "", "width=500, height=200, location=no, top=200px, left=500px");
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
    $scope.clearLogs = function() {
      //	if(confirm("This operation will clear all the logs on the server. Proceed clearing logs?")){
      dataManager.clearLogs(); //	}
    };
    socketService.setSignalListner(function(signal) {
      if (signal == 'DB_CLEARED') {
        $scope.vaults = []; //clear the present state
        dataManager.clearState();
        $scope.setStatusAlert('Logs were cleared');
      }
    });


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
      console.log("Called");
      dataManager.getActiveVaults();
    }, 10);
  }
];