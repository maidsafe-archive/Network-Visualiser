var ApplicationCtrl = ['$scope', '$rootScope', function($scope, $rootScope){
	
	$scope.iconsTrayClosed = true;

	$scope.vaults = []

	$scope.allVaultsExpanded = false;

	$scope.toggleIconsTray = function(){
		$scope.iconsTrayClosed = !$scope.iconsTrayClosed		
	}


	$scope.toggleExpandAllLogs = function(){
		$scope.allVaultsExpanded = !$scope.allVaultsExpanded
		$rootScope.$broadcast('expandVault', $scope.allVaultsExpanded)
	}

	//just for unit testing
	for(var i=0;i<40;i++){
		$scope.vaults.push({name:((100-i)+'demo')})		
	}
}];