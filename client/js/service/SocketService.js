var SocketService = ['$rootScope', 'dataManager', function($rootScope, dataManager){
	var active = true;	

	var socket = io.connect($rootScope.socketEndPoint);

	var signalObserver

	socket.on('log', function (data) {		
		if(active){
			setTimeout(function(){dataManager.pushLog(data)}, 1)//threaded so ui is non-blocking
		}			
	});

	socket.on('signal', function (data) {		
		if(signalObserver)
			signalObserver(data)
	});

	this.start = function(){
		active = true
	}

	this.stop = function(){
		active = false
	}

	this.setSignalListner = function(callback){
		signalObserver = callback
	}


}]