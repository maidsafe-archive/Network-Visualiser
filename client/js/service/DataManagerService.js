var DataManagerService = ['$http', '$rootScope', function($http, $rootScope){		

	var vaultLogPool,  vaults
	var addLogToPool

	vaultLogPool = {}//is this needed - might be for history play back
	vaults = []

	addLogToPool = function(log){		
		if(!vaultLogPool.hasOwnProperty(log.vault_id)){
			vaultLogPool[log.vault_id] = []			
			vaults.push({vault_id:log.vault_id})						
			$rootScope.$apply()									
		}
		vaultLogPool[log.vault_id].push(log);			
			
		notify(log)		
		console.log(vaults)
	}

	var notify = function(log){			
		$rootScope.$broadcast(log.vault_id, log)		
	}


	var activeVaults = function(){
		$http.get('/vaults').then(function(result){
			var vaults = result.data
			for(var key in vaults){
				var logs = vaults[key].logs.reverse()				
				for(var index in logs){
					logs[index].vault_id_full = vaults[key].vault_id_full
					addLogToPool(logs[index])
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
}]