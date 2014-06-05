var DataManagerService = ['$http', '$rootScope', function($http, $rootScope){		

	var vaultLogPool,  vaults
	var addLogToPool

	//vaultLogPool = {}//is this needed - might be for history play back
	vaults = []

	var vaultsInDisplay = {}

	var clear = function(){
		vaults = []
		// vaultLogPool = {}
		$rootScope.$apply()
	}

	addLogToPool = function(log){		
		if(!vaultsInDisplay.hasOwnProperty(log.vault_id)){			
			vaults.push({vault_id:log.vault_id})						
			vaultsInDisplay[log.vault_id] = {}
			$rootScope.$apply()									
		}				
		notify(log)				
	}

	var notify = function(log){			
		$rootScope.$broadcast(log.vault_id, log)		
	}


	var activeVaults = function(){
		$http.get('/vaults').then(function(result){
			var vaults = result.data
			for(var key in vaults){
				if(vaults[key].logs){
					var logs = vaults[key].logs.reverse()				
					for(var index in logs){
						logs[index].vault_id_full = vaults[key].vault_id_full
						addLogToPool(logs[index])
					}
				}												
			}			
		})
	}


	var clearLogs = function(){
		$http.get('/clearLogs').then(function(){
			alert('Logs have been cleared.')
		});
	}

	this.getActiveVaults = activeVaults	
	this.vaults = vaults
	this.pushLog = addLogToPool
	this.clearLogs = clearLogs
	this.clearVaults = clear
}]