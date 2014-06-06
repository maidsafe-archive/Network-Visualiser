var SocketService = ['$rootScope', 'dataManager', function($rootScope, dataManager){
	var active = true;	

	var socket = io.connect($rootScope.socketEndPoint);

	socket.on('log', function (data) {
		console.log(data)
		if(active){
			setTimeout(function(){dataManager.pushLog(data)}, 1)//threaded so ui is non-blocking
		}			
	});

	this.start = function(){
		active = true
	}

	this.stop = function(){
		active = false
	}


}]