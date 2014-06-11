var ApplicationCtrl = ['$scope', '$rootScope', 'dataManager', 'socketService', function($scope, $rootScope, dataManager, socketService){
	
		$scope.iconsTrayClosed = true;
		
		$scope.vaults = []

		$scope.allVaultsExpanded = false;

		$scope.showLoader = true
		
		$scope.alert
	
		$scope.timeline = function(){		
 			var win = window.open('/client/timeline.html', '_blank');
  			win.focus();		
		}	

		$scope.setStatusAlert = function(msg){
			$scope.alert = msg
			setTimeout(function(){ $scope.alert = null}, 5000)
		}

		$scope.toggleIconsTray = function(){
			$scope.iconsTrayClosed = !$scope.iconsTrayClosed		
		}


		$scope.toggleExpandAllLogs = function(){
			$scope.allVaultsExpanded = !$scope.allVaultsExpanded
			$rootScope.$broadcast('expandVault', $scope.allVaultsExpanded)
		}

		$scope.clearLogs = function(){
		//	if(confirm("This operation will clear all the logs on the server. Proceed clearing logs?")){
				dataManager.clearLogs()			
		//	}
		}

		// $scope.stopRealtime = function(){		
		// 	socketService.stop()
		// }

		// $scope.startRealTime = function(){
		// 	socketService.start()
		// }
		
		socketService.setSignalListner(function(signal){
			if(signal == 'DB_CLEARED'){
				$scope.stopHistoryPlayback()
				$scope.vaults = []//clear the present state		
				dataManager.clearState()
				$scope.setStatusAlert('Logs were cleared')
			}		
		});



		var newVault = function(vault){	
			$scope.vaults.push(vault)
			if(!$scope.$$phase)
				$scope.$apply()
		}

		var onVaultsLoaded = function(time){
			$scope.showLoader = false
			if(!$scope.vaults || $scope.vaults.length == 0){
				$scope.setStatusAlert('No active vaults')
			}	
		}
		
		dataManager.onNewVault(newVault)
		dataManager.onVaultsLoaded(onVaultsLoaded)	

		setTimeout(function(){
			dataManager.getActiveVaults()
		}, 10)

		



}];