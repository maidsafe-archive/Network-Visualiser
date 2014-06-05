var ApplicationCtrl = ['$scope', '$rootScope', 'dataManager', 'socketService', 'playbackService' , function($scope, $rootScope, dataManager, socketService, playbackService){
	
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

	$scope.stopRealtime = function(){
		socketService.stop()
	}

	$scope.startRealTime = function(){
		socketService.start()
	}

	$scope.playHistory = function(_time){			
		playbackService.play(_time)
	}

	$scope.pauseHistoryPlayback = function(_time){			
		playbackService.pause()
	}

	$scope.resumeHistoryPlayback = function(_time){			
		playbackService.resume()
	}


	$scope.reset = function(){
		dataManager.clearAll()
		dataManager.getActiveVaults()		
	}

	$scope.$on('push', function(e, log){
		dataManager.pushLog(log)
	})



	setTimeout(function(){dataManager.getActiveVaults()}, 100)

}];