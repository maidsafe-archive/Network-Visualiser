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

	$scope.playback = {currentState : 0, max_steps : 1000, incrementalSteps:0 , currentPlayTime:null }

	$scope.maxTime = new Date()
	
	$scope.playingTime = new Date()

	socketService.stop()

	$scope.autoSeekItervalId 

	$scope.$watch('playback.currentState', function(newValue){	
		if($scope.firstLogtime){
			$scope.playback.currentPlayTime = $scope.getPlayTime(parseInt(newValue))
			if(!$scope.$$phase)
				$scope.$apply()
			if($scope.autoSeekItervalId){
				clearTimeout($scope.autoSeekItervalId)
				$scope.autoSeekItervalId = null
			}
			$scope.autoSeekItervalId = setTimeout(function(){
				$scope.stopHistoryPlayback()
				$scope.playHistory()
			}, 2000)			
		}				
	} )

	$scope.updatePlayingTime = function(){		
		$scope.playback.currentState += $scope.playback.incrementalSteps; 										
		$scope.playback.currentPlayTime += 1000	
	}

	
	$scope.setStatusAlert = function(msg){
		$scope.alert = msg
		setTimeout(function(){ $scope.alert = null}, 2000)
	}

	$scope.toggleIconsTray = function(){
		$scope.iconsTrayClosed = !$scope.iconsTrayClosed		
	}


	$scope.toggleExpandAllLogs = function(){
		$scope.allVaultsExpanded = !$scope.allVaultsExpanded
		$rootScope.$broadcast('expandVault', $scope.allVaultsExpanded)
	}
	

	$scope.getPlayTime = function(playFrom){		
		var time = $scope.maxTime.getTime();	
		var date = new Date(time - ((($scope.playback.max_steps - playFrom)/$scope.playback.max_steps) * (time  - $scope.firstLogtime)))			
		return date.getTime()
	}		


	$scope.playHistory = function(){
		$rootScope.playerPaused = false		
		var _time = new Date($scope.playback.currentPlayTime).toISOString()
		$scope.playerState = $scope.PLAYER_STATE.PLAYING		
		$scope.vaults = []//clear the present state		
		dataManager.clearState()
		$scope.showLoader = true
		dataManager.getActiveVaults(_time)			
		$scope.playerStatus = "Buffering..."
	}

	$scope.pauseHistoryPlayback = function(){					
		$rootScope.playerPaused = true
		$scope.playerState = $scope.PLAYER_STATE.PAUSED
		playbackService.pause()
	}

	$scope.resumeHistoryPlayback = function(){
		$rootScope.playerPaused = false					
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

	
	var newVault = function(vault){	
		$scope.vaults.push(vault)
		if(!$scope.$$phase)
			$scope.$apply()
	}

	var onVaultsLoaded = function(time){
		$scope.showLoader = false		
		if(!$scope.vaults || $scope.vaults.length == 0){
			$scope.playerStatus = 'No active vaults'
			setTimeout(function(){
				$scope.playerStatus = ''
				if(!$scope.$$phase)
					$scope.$apply()
			}, 3000)
		}
		if(time){		
			playbackService.play(time)
		}	
	}

	var updatePlayerStatus = function(status){				
		switch(status){
			case 0://playing
				$scope.playerStatus = ""
				$scope.updatePlayingTime()
				break;


			case 3://resume
				$scope.updatePlayingTime()
				break;

		}		

		if(!$scope.$$phase)
				$scope.$apply()				
	}

		
	dataManager.onNewVault(newVault)
	dataManager.onVaultsLoaded(onVaultsLoaded)	


	playbackService.onStatusChange(updatePlayerStatus)


	$http.get('/firstuptime').then(function(res){
			$scope.firstLogtime = new Date(res.data).getTime()	- 3000//reducing 3 secondes for the play				
			$scope.playback.incrementalSteps = 1000 / ( (new Date($scope.maxTime).getTime() - $scope.firstLogtime) / $scope.playback.max_steps )			
			$scope.playback.currentPlayTime = $scope.firstLogtime			
	})

	setTimeout(function(){
		dataManager.getActiveVaults()
	}, 10)


}]