var ApplicationCtrl = ['$scope', '$rootScope', '$http', 'dataManager', 'socketService', 'playbackService' , 
	function($scope, $rootScope, $http, dataManager, socketService, playbackService){
	
		$scope.iconsTrayClosed = true;
		
		$scope.vaults = []

		$scope.allVaultsExpanded = false;

		$scope.playerStatus = ""
		
		$scope.PLAYER_STATE = { PLAYING : "playing", STOPED : "stoped", PAUSED : 'pause'}

		$scope.playerState = $scope.PLAYER_STATE.STOPED

		$scope.showLoader = true
		
		$scope.firstLogtime

		$scope.playbackTime = 100

		$scope.alert
		

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

		$scope.stopRealtime = function(){		
			socketService.stop()
		}

		$scope.startRealTime = function(){
			socketService.start()
		}

		socketService.setSignalListner(function(signal){
			if(signal == 'DB_CLEARED'){
				$scope.stopHistoryPlayback()
				$scope.vaults = []//clear the present state		
				dataManager.clearState()
				$scope.setStatusAlert('Logs were cleared')
			}		
		});

		var getPlayTime = function(playFrom){
			var currentTime	= new Date().getTime();	
			var date = new Date(currentTime - (((100 - playFrom)/100) * (currentTime  - $scope.firstLogtime)))			
			return date.toISOString()
		}

		

		$scope.playHistory = function(playTime){	
			var _time = getPlayTime(parseInt(playTime))
			$scope.stopRealtime()
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
			$scope.startRealTime()	
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


		playbackService.onStatusChange(updatePlayerStatus)

		dataManager.onNewVault(newVault)
		dataManager.onVaultsLoaded(onVaultsLoaded)	

		setTimeout(function(){
			dataManager.getActiveVaults()
		}, 10)

		$http.get('/firstuptime').then(function(data){		
			$scope.firstLogtime = new Date(data.data).getTime()	- 2000//reducing 2 secondes for the play	
		})



}];