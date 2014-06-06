var PlaybackService = ['$http', '$filter', 'dataManager' , function($http, $filter, dataManager){

	var _playbackTime
	var timerId = 0
	var nextPushTime
	var playEndsAt
	var timePool = {}
	var SPEED = 1000

	var playerStatus = ""
	

	var statusChangeListner

	var dateFormater = function(date){
		return $filter('date')(date, 'MMM dd yy HH:mm:ss')
	}

	var onNetworkError = function(err){
			console.error(err.data)
	}

	var getDateKey = function(timestamp){
		return timestamp.substr(0, 19)//from the ISO string trim out the milliseconds part
	}

	var clearAll = function(){
		clearInterval(timerId)
		timePool = {}		
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
				if(!timePool.hasOwnProperty(key)){
					timePool[key] = []
				}
				timePool[key].push(log)
			}			
		}
	}

	//sorting by id to arrange in the same sequence order of recieving the logs
	var sortTimePool = function(){
		for(var key in timePool){
			timePool[key] = $filter('orderBy')(timePool[key], '-__id')
		}
		setPlayerStatus("Ready to play")					
	}

	
	var prepareData = function(data){			
		populateTimePool(data.data)		
		sortTimePool()			
		start()	
	}


	var start = function(){				
		setPlayerStatus("Starting to play")
		timerId = setInterval(pushLogs,SPEED) 
	}
	
	

	var pushLogs = function(){
		setPlayerStatus(dateFormater(new Date(nextPushTime)) + ' / ' + dateFormater(new Date(playEndsAt)))
		var logs = timePool[getDateKey(new Date(nextPushTime).toISOString())]
		if(logs && logs.length>0){
			for(var index in logs){				
				dataManager.pushLog(logs[index])
			}			
		}
		if(logs)
			timePool[getDateKey(new Date(nextPushTime).toISOString())] = null
		updateNextPushTime()		
	}

	var updateNextPushTime = function(){		
		if( playEndsAt < nextPushTime )
			this.stop()
		else
			nextPushTime += SPEED
	}
	
	this.play = function(time){		
		playEndsAt = new Date().getTime()	
		setPlayerStatus("Preparing for playback")
		clearAll()	
		nextPushTime = new Date(time).getTime()
		$http.get('/search?ts='+time).then(prepareData, onNetworkError)
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