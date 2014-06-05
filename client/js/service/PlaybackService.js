var PlaybackService = ['$http', '$filter', 'dataManager' , function($http, $filter, dataManager){

	var _playbackTime
	var timerId = 0
	var nextPushTime

	var timePool = {}

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
	}

	
	var prepareData = function(data){			
		populateTimePool(data.data)		
		sortTimePool()	
		start()	
	}
	

	var start = function(){		
		timerId = setInterval(pushLogs,1000) 
	}
	
	this.play = function(time){	
		clearAll()	
		nextPushTime = new Date(time).getTime()
		$http.get('/search?ts='+time).then(prepareData, onNetworkError)
	}

	this.pause = function(){
		clearInterval(timerId)
	}

	this.resume = function(){
		start()
	}

	var pushLogs = function(){	
		var logs = timePool[getDateKey(new Date(nextPushTime).toISOString())]
		if(logs && logs.length>0){
			console.log('PUSH')
			console.log(logs)
		}
		updateNextPushTime()		
	}

	var updateNextPushTime = function(){
		nextPushTime += 1000
	}
	
	
}]