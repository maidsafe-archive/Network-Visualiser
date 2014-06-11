var PlaybackService = ['$http', '$filter', 'dataManager' , function($http, $filter, dataManager){

	var _playbackTime
	var timerId = 0
	var nextPushTime
	var playEndsAt
	var timePool
	var SPEED = 1000
	var BUFFER_MINUTES = 1
	var lastBufferedTime
	var bufferMonitor = 0
	var firstBuffer = true
	var buffer_pool = {}	
	
	var playerStatus = ""
	
	var statusChangeListner

	var dateFormater = function(date){
		return $filter('date')(date, 'MMM dd yy HH:mm:ss')
	}

	var onNetworkError = function(err){
			buffering = false
			console.error(err.data)		
	}

	var getDateKey = function(timestamp){
		return timestamp.substr(0, 19)//from the ISO string trim out the milliseconds part
	}

	var clearAll = function(){
		clearInterval(timerId)
		timerId = null		
		timePool = null	
		bufferMonitor = 0
		firstBuffer = true	
		buffer_pool = {}	
	}

	var setPlayerStatus = function(status){
		playerStatus = status
		statusChangeListner(playerStatus)
	}

	var populateTimePool = function(history){
		var key, log
		for(var vault in history){		
			for(var index in history[vault]){
				log = history[vault][index]
				key = getDateKey(log.ts)
				if(!buffer_pool.hasOwnProperty(key)){
					buffer_pool[key] = []
				}
				buffer_pool[key].push(log)
			}			
		}
	}

	//sorting by id to arrange in the same sequence order of receiving the logs
	var sortTimePool = function(){
		for(var key in buffer_pool){
			buffer_pool[key] = $filter('orderBy')(buffer_pool[key], '-__id')
		}
		if(!timePool){
			timePool = buffer_pool
			setPlayerStatus("Ready to play")
			buffer_pool = {}
		}else{
			for(var key in buffer_pool){
				timePool[key] = buffer_pool[key]
			}
			buffer_pool = {}
		}						
	}

	
	var prepareData = function(data){				
		buffering = false
		populateTimePool(data.data)		
		sortTimePool()
		if(!timerId)					
			start()	
	}


	var start = function(){				
		setPlayerStatus("Starting to play")		
		timerId = setInterval(pushLogs,SPEED) 				
	}
	
	var PushWrapper = function(log){
		var _log = log
		this.push = function(){
			dataManager.pushLog(_log)
		}
	}

	var pushLogs = function(){
		setPlayerStatus(dateFormater(new Date(nextPushTime)))
		var logs = timePool[getDateKey(new Date(nextPushTime).toISOString())]		
		if(logs && logs.length>0){
			for(var index in logs){				
				setTimeout(new PushWrapper(logs[index]).push,1)
			}			
		}
		updateNextPushTime()		
	}


	var isEmpty = function(obj){
		for(var o in obj)
			return false
		return true
	}

	var loadBuffer = function(){
		var condition		
		if(firstBuffer){			
			condition = (BUFFER_MINUTES * 60)/4
		}else{
			condition = BUFFER_MINUTES * 60		
		}		
		bufferMonitor++;
		if(bufferMonitor == condition){
			firstBuffer  = false
			bufferMonitor = 0
			if(isEmpty(buffer_pool) && !buffering){			
				buffering = true
				lastBufferedTime += (BUFFER_MINUTES * 60000)			
				$http.get('/search?offset=' + BUFFER_MINUTES + '&ts='+ new Date(lastBufferedTime).toISOString()).then(prepareData, onNetworkError)		
			}
		}					
	}

	

	var updateNextPushTime = function(){			
		if( playEndsAt < nextPushTime )
			this.stop()
		else{
			nextPushTime += SPEED
		}	
		loadBuffer()		
	}

	
	this.play = function(time){		
		playEndsAt = new Date().getTime()	
		setPlayerStatus("Preparing for playback")
		clearAll()	
		nextPushTime = new Date(time).getTime()
		lastBufferedTime = nextPushTime
		$http.get('/search?offset=' + BUFFER_MINUTES + '&ts='+time).then(prepareData, onNetworkError)		
	}

	this.pause = function(){
		setPlayerStatus("Paused at " + dateFormater(new Date(nextPushTime)))
		clearInterval(timerId)
	}

	this.resume = function(){
		start()
	}


	this.stop = function(){		
		clearAll()			
		setPlayerStatus('')
	}
	

	this.onStatusChange = function(callback){
		statusChangeListner = callback
	}

}]