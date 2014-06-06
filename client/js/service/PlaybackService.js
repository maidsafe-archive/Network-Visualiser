var PlaybackService = ['$http', '$filter', 'dataManager' , function($http, $filter, dataManager){

	var _playbackTime
	var timerId = 0
	var nextPushTime

	var timePool = {}

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

	var sortTimePool = function(){
		for(var key in timePool){
			timePool[key] = $filter('orderBy')(timePool[key], '-ts')
		}
		setPlayerStatus("Ready to play")					
	}

	
	var prepareData = function(data){			
		populateTimePool(data.data)		
		sortTimePool()			
		start()	
	}


	var start = function(){				
		setPlayerStatus("Starting to play " + dateFormater(new Date(nextPushTime)))
		timerId = setInterval(pushLogs,1000) 
	}
	
	

	var pushLogs = function(){
		setPlayerStatus('Playing - ' + dateFormater(new Date(nextPushTime)))		
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
		nextPushTime += 1000
	}
	
	this.play = function(time){			
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