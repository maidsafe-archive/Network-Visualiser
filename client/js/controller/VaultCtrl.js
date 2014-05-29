var VaultCtrl = ['$scope', function($scope){
	$scope.stateIcon = "info.png"
	$scope.logsOpen = false

	$scope.toggleStateIcon = function(){
		$scope.logsOpen = !$scope.logsOpen		
		$scope.stateIcon = $scope.logsOpen?"arrow-up.png":"info.png"
	}
}]