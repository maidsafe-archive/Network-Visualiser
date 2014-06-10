var socket = require('./../../socket/Socket.js')

exports.SaveLogHandler = function(res){
	this.res = res

	var onLogSaved = function(data){	
		socket.broadcastLog(data)
		res.send('Saved')
	}

	var onDatabaseError = function(err){
		res.send(500, err.message || err)
	}

	this.promise = function(err, data){		
		err?onDatabaseError(err):onLogSaved(data)
	}

	return this.promise;
}


exports.SearchHandler = function(res){
	this.res = res
	

	var onComplete = function(data){	
		res.send(data)
	}

	var onDatabaseError = function(err){			
		res.send(500, err.message)
	}

	this.promise = function(err, data){		
		err?onDatabaseError(err):onComplete(data)
	}

	return this.promise;
}

exports.DatabaseCleared = function(res){
	socket.broadcastSignal("DB_CLEARED")
	res.send("Database cleared")
}