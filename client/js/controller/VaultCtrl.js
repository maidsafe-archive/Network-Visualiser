var VaultCtrl = ['$scope', function($scope){
	$scope.stateIcon
	$scope.logsOpen
	$scope.progressLevel


	$scope.updateProgress = function(progress){
		$scope.progressLevel = {width: (progress+'%')}		
	}

	$scope.toggleVaultLogs = function(expand){
		$scope.logsOpen = expand?expand:!$scope.logsOpen		
		$scope.stateIcon = $scope.logsOpen?"arrow-up.png":"info.png"
	}

	$scope.$on('expandVault', function(e, v){				
		//If the node is already in the expanded/collapsed state then, no action is needed to be performed 
		if(v == $scope.logsOpen)
			 return;
		$scope.toggleVaultLogs(v)
	})

	//initialize the controller
	$scope.updateProgress(0)//update progress to zero initially
	$scope.stateIcon = "info.png"
	$scope.logsOpen = false
}]