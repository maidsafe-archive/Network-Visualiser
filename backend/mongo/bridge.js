var db, vaultLog, mongoose, logManager, vaultStatus, firstLogTime;
mongoose = require('mongoose');
logManager = require('./LogManager.js');
vaultStatus = require('./VaultStatus.js');
config = require('./../../Config.js');

 
mongoose.connect(config.Constants.mongo_con);
db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
   console.log('Mongodb connected successfully')  
   vaultLog = logManager.getManager(db)      
   vaultStatus = vaultStatus.VaultHealth(db)
   vaultStatus.getFirstLogTime().then(function(doc){
   		firstLogTime = doc.first_update || new Date()
   })
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
}

exports.getActiveVaults = function(){	
	return vaultStatus.getActiveVaults()
}

exports.getAllVaultNames = function(){
	return vaultStatus.getAllVaultNames()
}

exports.firstLogTime = function(){
	return firstLogTime
}