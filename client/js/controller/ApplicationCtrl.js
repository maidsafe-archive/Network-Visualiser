var ApplicationCtrl = ['$scope', '$rootScope', 'dataManager', function($scope, $rootScope, dataManager){
	
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


	window.dm = dataManager//for testing


}];