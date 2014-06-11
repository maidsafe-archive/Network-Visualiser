var TimelineCtrl = ['$scope', '$rootScope', '$http', 'dataManager', 'playbackService', 'socketService', function($scope, $rootScope, $http, dataManager, playbackService, socketService){


	$scope.iconsTrayClosed = true;
	
	$scope.vaults = []

	$scope.allVaultsExpanded = false;

	$scope.showLoader = true
	
	$scope.alert

	$scope.playerStatus = ""
	
	$scope.PLAYER_STATE = { PLAYING : "playing", STOPED : "stoped", PAUSED : 'pause'}

	$scope.playerState = $scope.PLAYER_STATE.STOPED

	$scope.firstLogtime

	$scope.playbackTime = 100

	$scope.maxTime = new Date()

	socketService.stop()


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
	

	var getPlayTime = function(playFrom){
		var time	= $scope.maxTime.getTime();	
		var date = new Date(time - (((100 - playFrom)/100) * (time  - $scope.firstLogtime)))			
		return date.toISOString()
	}		

	$scope.playHistory = function(playTime){	
		var _time = getPlayTime(parseInt(playTime))		
		$scope.playerState = $scope.PLAYER_STATE.PLAYING		
		$scope.vaults = []//clear the present state		
		dataManager.clearState()
		$scope.showLoader = true
		dataManager.getActiveVaults(_time)					
	}

	$scope.pauseHistoryPlayback = function(){			
		$scope.playerState = $scope.PLAYER_STATE.PAUSED
		playbackService.pause()
	}

	$scope.resumeHistoryPlayback = function(){			
		$scope.playerState = $scope.PLAYER_STATE.PLAYING
		playbackService.resume()
	}

	$scope.stopHistoryPlayback = function(){			
		$scope.playerState = $scope.PLAYER_STATE.STOPED
		playbackService.stop()
	}

	$scope.stopPlayer = function(){
		$scope.playerState = $scope.PLAYER_STATE.STOPED		
		playbackService.pause()
		dataManager.clearState()
	}

	$scope.reset = function(){
		if($scope.playerState != $scope.PLAYER_STATE.STOPED){
			$scope.stopHistoryPlayback()
		}			
		$scope.vaults = []	
		dataManager.clearState()		
		dataManager.getActiveVaults()		
	}

	
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
		if(time){
			$scope.playerStatus = "Preparing playback.."
			playbackService.play(time)
		}		
	}

	var updatePlayerStatus = function(status){
		$scope.playerStatus = status
		if(!$scope.$$phase)
			$scope.$apply()
	}

		
	dataManager.onNewVault(newVault)
	dataManager.onVaultsLoaded(onVaultsLoaded)	



	playbackService.onStatusChange(updatePlayerStatus)


	$http.get('/firstuptime').then(function(data){		
			$scope.firstLogtime = new Date(data.data).getTime()	- 2000//reducing 2 secondes for the play	
	})

	setTimeout(function(){
		dataManager.getActiveVaults()
	}, 10)


}]