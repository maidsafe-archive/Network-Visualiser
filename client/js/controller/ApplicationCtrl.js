var ApplicationCtrl = ['$scope', function($scope){
	
	$scope.iconsTrayClosed = true;

	$scope.vaults = [1,2,3,4,5]

	$scope.toggleIconsTray = function(){
		$scope.iconsTrayClosed = !$scope.iconsTrayClosed		
	}

	for(var i=0;i<40;i++){
		$scope.vaults.push(i*100)		
	}

}];