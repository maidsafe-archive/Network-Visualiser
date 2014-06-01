var socket = require('./../../socket/socket.js')

exports.SaveLogHandler = function(res){
	this.res = res

	var onLogSaved = function(data){	
		socket.broadcastLog(data)
		res.send('Saved')
	}

	var onDatabaseError = function(err){			
		res.send(err.message)
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
		res.send(err.message)
	}

	this.promise = function(err, data){		
		err?onDatabaseError(err):onComplete(data)
	}

	return this.promise;
}
