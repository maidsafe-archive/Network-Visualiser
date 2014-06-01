var ApplicationCtrl = ['$scope', '$rootScope', 'dataManager', 'socketService' , function($scope, $rootScope, dataManager, socketService){
	
	$scope.iconsTrayClosed = true;
	
	$scope.vaults = dataManager.vaults	

	$scope.allVaultsExpanded = false;



	$scope.toggleIconsTray = function(){
		$scope.iconsTrayClosed = !$scope.iconsTrayClosed		
	}


	$scope.toggleExpandAllLogs = function(){
		$scope.allVaultsExpanded = !$scope.allVaultsExpanded
		$rootScope.$broadcast('expandVault', $scope.allVaultsExpanded)
	}

	$scope.clearLogs = function(){
		if(confirm("This operation will clear all the logs on the server. Proceed clearing logs?")){
			dataManager.clearLogs()			
		}
	}

	$scope.$on('push', function(e, log){
		dataManager.pushLog(log)
	})

	setTimeout(function(){dataManager.getActiveVaults()}, 100)

}];