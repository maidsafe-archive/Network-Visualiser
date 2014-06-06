var VaultCtrl = ['$scope', 'dataManager', 'vaultBehaviour', function($scope, dataManager, vaultBehaviour){
	$scope.stateIcon
	$scope.logsOpen
	$scope.progressLevel
	$scope.vaultName	
	$scope.fullVaultName
	$scope.logs
	$scope.vaultBehaviour = vaultBehaviour
	$scope.iconsTray	
	$scope.isActive = false


	$scope.PERSONA_COLOUR_TAG = "persona_"
	

	$scope.updateFromQueue = function(){
		var logs = dataManager.getLogsFromQueue($scope.vaultName)
		for(var index in logs){			
			$scope.logRecieved(logs[index])
		}
	}

	//initialize the controller
	$scope.init = function(vault){			
		$scope.updateProgress(0);
		$scope.stateIcon = "info.png";
		$scope.logsOpen = false;		
		$scope.vaultName = vault.vault_id
		$scope.logs = []
		$scope.personaColour = $scope.PERSONA_COLOUR_TAG + $scope.vaultBehaviour.personas[0]				
		$scope.updateIcons(0)	
		dataManager.setLogListner($scope.vaultName, $scope.logRecieved)
		$scope.updateFromQueue()		
	}

	$scope.updateIcons = function(actionId){
		$scope.iconsTray = $scope.vaultBehaviour.icons[actionId]		
	}

	$scope.addLog = function(log){		
		if($scope.logs.length>=$scope.vaultBehaviour.MAX_LOGS)
			$scope.logs.shift()
		$scope.logs.push(log)				
	}

	$scope.stateOfVault = function(log){
		$scope.isActive = (log.action_id != 18)
	}

	$scope.logRecieved = function(log){		
		$scope.addLog(log)
		$scope.personaColour = $scope.PERSONA_COLOUR_TAG + $scope.vaultBehaviour.personas[log.persona_id]
		if(log.action_id == 17){
			$scope.updateProgress(log.value1)
		}else{
			$scope.subscriber = null
			$scope.counter = null
			$scope.updateIcons(log.action_id)
		}			
		if(log.action_id == 1 || log.action_id == 2){
			$scope.counter = log.value1			
		}else if(log.action_id == 6 || log.action_id == 7){
			$scope.subscriber = log.value1			
		}
		if(!$scope.fullVaultName && (log.action_id == 0 || log.hasOwnProperty('vault_id_full'))){			
			$scope.fullVaultName =  log.vault_id_full || log.value1
		}
		$scope.stateOfVault(log)
		if(!$scope.$$phase)
			$scope.$apply()		
	}

	$scope.updateProgress = function(progress){
		$scope.progressLevel = {width: (progress+'%')};		
	}

	$scope.toggleVaultLogs = function(expand){
		$scope.logsOpen = expand?expand:!$scope.logsOpen;					
		$scope.stateIcon = $scope.logsOpen?"arrow-up.png":"info.png";
	}


	$scope.$on('expandVault', function(e, v){						
		if(v == $scope.logsOpen)
			return;
		$scope.toggleVaultLogs(v)
	})
	

	$scope.lastLog = function(){		
		return $scope.logs.length>0?$scope.vaultBehaviour.formatMessage($scope.logs[$scope.logs.length-1]):""
	}
}]
