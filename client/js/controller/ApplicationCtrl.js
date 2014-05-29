var ApplicationCtrl = ['$scope', function($scope){
	
	$scope.iconsTrayClosed = true;

	$scope.vaults = []

	$scope.toggleIconsTray = function(){
		$scope.iconsTrayClosed = !$scope.iconsTrayClosed		
	}

	for(var i=0;i<40;i++){
		$scope.vaults.push(i*100)		
	}

}];