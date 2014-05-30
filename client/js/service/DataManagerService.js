var DataManagerService = ['$http', '$rootScope', function($http, $rootScope){
	

	//{vault_id:"", persona_id:1, action_id:2, value1:0, value:2, ts: new Date()}

	var vaultLogPool,  vaults;
	var addLogToPool, getLogsForVault

	vaultLogPool = {}
	vaults = []

	addLogToPool = function(log){
		if(!vaultLogPool.hasOwnProperty(log.vault_id)){
			vaultLogPool[log.vault_id] = []
			vaults.push(log.vault_id)
			$rootScope.$apply()
		}
		vaultLogPool[log.vault_id].push(log);
		notify(log);		
	}

	var notify = function(log){		
		$rootScope.$broadcast(log.vault_id, log)			
	}
	


	this.vaults = vaults
	this.pushLog = addLogToPool;
	this.getLogsForVault = getLogsForVault
}]