var db, vaultLog, mongoose, logManager, vaultStatus;
mongoose = require('mongoose');
logManager = require('./LogManager.js');
vaultStatus = require('./VaultStatus.js');

 
mongoose.connect('mongodb://localhost:27017/maidsafe_logs');
db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
   console.log('Mongodb connected successfully')  
   vaultLog = logManager.getManager(db)      
   vaultStatus = vaultStatus.VaultHealth(db)
});

exports.addLog = function(data, promise){
	vaultStatus.updateStatus(data)
	vaultLog.save(data, promise)
}

exports.searchLog = function(criteria, promise){
	vaultLog.search(criteria, promise)
}

exports.vaultHistory = function(vaultId, page, max, promise){	
	return vaultLog.history(vaultId, page, max, promise)
}


exports.dropDB = function(){
	db.db.dropDatabase()	
}

exports.getActiveVaults = function(){	
	return vaultStatus.getActiveVaults()
}