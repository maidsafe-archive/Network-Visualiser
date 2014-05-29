var VaultCtrl = ['$scope', function($scope){
	$scope.stateIcon
	$scope.logsOpen
	$scope.progressLevel

	$scope.updateProgress = function(progress){
		$scope.progressLevel = {width: (progress+'%')}		
	}

	$scope.toggleStateIcon = function(){
		$scope.logsOpen = !$scope.logsOpen		
		$scope.stateIcon = $scope.logsOpen?"arrow-up.png":"info.png"
	}

	//initialize the controller
	$scope.updateProgress(0)//update progress to zero initially
	$scope.stateIcon = "info.png"
	$scope.logsOpen = false
}]