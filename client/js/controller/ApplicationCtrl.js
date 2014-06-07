var ApplicationCtrl = ['$scope', '$rootScope', 'dataManager', 'socketService', 'playbackService' , function($scope, $rootScope, dataManager, socketService, playbackService){
	
	$scope.iconsTrayClosed = true;
	
	$scope.vaults = []

	$scope.allVaultsExpanded = false;

	$scope.playerStatus = ""
	
	$scope.PLAYER_STATE = { PLAYING : "playing", STOPED : "stoped", PAUSED : 'pause'}

	$scope.playerState = $scope.PLAYER_STATE.STOPED


	$scope.units = [{id:'Minutes', offset:60}, {id:'Seconds', offset:1}, {id:'Hours', offset:3600}]

	$scope.playBackUnit = $scope.units[0]
	

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


	var getPlayTime = function(rollBackTo, timeUnit){	
		var date = new Date(new Date().getTime() - (parseFloat(rollBackTo) * ( timeUnit * 1000 )))	
		if(timeUnit>60)
			date.setSeconds(0)	
		return date.toISOString()
	}

	var isNumber = function(num){
		try{
			parseFloat(num)
			return true
		}catch(e){
			return false
		}
	}

	$scope.playHistory = function(rollBackTo, timeUnit){
		if(isNumber(rollBackTo)){
			var _time = getPlayTime(rollBackTo, timeUnit)
			$scope.stopRealtime()
			$scope.playerState = $scope.PLAYER_STATE.PLAYING		
			$scope.vaults = []//clear the present state		
			dataManager.clearState()
			dataManager.getActiveVaults(_time)			
		}else{
			alert("Enter a valid number")
		}	
		
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
		$scope.startRealTime()	
		dataManager.getActiveVaults()		
	}

	
	var newVault = function(vault){	
		$scope.vaults.push(vault)
		if(!$scope.$$phase)
			$scope.$apply()
	}

	var onVaultsLoaded = function(time){
		$scope.playerStatus = "Preparing playback.."
		playbackService.play(time)
	}

	var updatePlayerStatus = function(status){
		$scope.playerStatus = status
		if(!$scope.$$phase)
			$scope.$apply()
	}


	playbackService.onStatusChange(updatePlayerStatus)

	dataManager.onNewVault(newVault)
	dataManager.onVaultsLoaded(onVaultsLoaded)	

	setTimeout(function(){dataManager.getActiveVaults()}, 100)

}];