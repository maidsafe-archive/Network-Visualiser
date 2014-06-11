var db, vaultLog, mongoose, logManager, vaultStatus;
mongoose = require('mongoose');
logManager = require('./LogManager.js');
vaultStatus = require('./VaultStatus.js');
dbUtils = require('./DBUtils.js');
config = require('./../../Config.js');

 
mongoose.connect(config.Constants.mongo_con);
db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
   console.log('Mongodb connected successfully')  
   vaultLog = logManager.getManager(db)      
   vaultStatus = vaultStatus.VaultHealth(db)  
   dbUtils = dbUtils.getDBUtil(db)
});

exports.addLog = function(log, promise){
	vaultStatus.updateStatus(log)
	vaultStatus.isVaultActive(log).then(function(isActive){		
		if(isActive || log.action_id == 0 || log.action_id == 18)
			vaultLog.save(log, promise)
		else{			
			promise('Vault is not active')
		}			
	})	
}

exports.searchLog = function(criteria, promise){	
	vaultLog.search(criteria, promise)
}

exports.vaultHistory = function(vaultId, criteria, page, max, promise){	
	return vaultLog.history(vaultId, criteria, page, max, promise)
}


exports.dropDB = function(){
	db.db.dropDatabase()
	vaultStatus.clearFirstLogTime()		
}

exports.getActiveVaults = function(){	
	return vaultStatus.getActiveVaults()
}

exports.getAllVaultNames = function(){
	return vaultStatus.getAllVaultNames()
}

exports.firstLogTime = function(){
	return vaultStatus.getFirstLogTime()
}

exports.exportLogs = function(){
	return dbUtils.exportLogs()
}