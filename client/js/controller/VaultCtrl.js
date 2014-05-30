var VaultCtrl = ['$scope', 'dataManager', 'vaultBehaviour', function($scope, dataManager, vaultBehaviour){
	$scope.stateIcon
	$scope.logsOpen
	$scope.progressLevel
	$scope.vaultName	
	$scope.logs
	$scope.vaultBehaviour = vaultBehaviour

	$scope.PERSONA_COLOUR_TAG = "persona_"
	
	//initialize the controller
	$scope.init = function(vaultName){	
		$scope.updateProgress(0);
		$scope.stateIcon = "info.png";
		$scope.logsOpen = false;		
		$scope.vaultName = vaultName
		$scope.logs = []
		$scope.personaColour = $scope.PERSONA_COLOUR_TAG + $scope.vaultBehaviour.personas[0]		
		$scope.$on(vaultName, function(e, log){
			$scope.logRecieved(log)
		})
		$scope.updateIcons(0)
	}

	$scope.updateIcons = function(actionId){
		var icons = $scope.vaultBehaviour.icons[actionId]
		$scope.accountClass = icons.account
		$scope.chunkClass = icons.chunk
		$scope.subscriberClass = icons.subscriber
		$scope.counterClass = icons.counter
	}

	$scope.logRecieved = function(log){		
		$scope.logs.push(log)	
		$scope.personaColour = $scope.PERSONA_COLOUR_TAG + $scope.vaultBehaviour.personas[log.persona_id]
		$scope.updateIcons(log.action_id)//few cases no update needed - check it
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
	
}]