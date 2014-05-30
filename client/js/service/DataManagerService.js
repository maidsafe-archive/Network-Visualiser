var DataManagerService = ['$http', '$rootScope', function($http, $rootScope){		

	var vaultLogPool,  vaults
	var addLogToPool

	//vaultLogPool = {}//is this needed - might be for history play back
	vaults = []

	addLogToPool = function(log){
		if(!vaultLogPool.hasOwnProperty(log.vault_id)){
			vaultLogPool[log.vault_id] = []
			vaults.push(log.vault_id)
			$rootScope.$apply()
		}
		//vaultLogPool[log.vault_id].push(log);
		notify(log);		
	}

	var notify = function(log){		
		$rootScope.$broadcast(log.vault_id, log)			
	}
	
	this.vaults = vaults
	this.pushLog = addLogToPool
}]