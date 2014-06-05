var SocketService = ['$rootScope', function($rootScope){
	var active = true;	

	var socket = io.connect($rootScope.socketEndPoint);
	socket.on('log', function (data) {
		if(active)
			$rootScope.$broadcast('push', data);		    
	});


	this.start = function(){
		active = true
	}

	this.stop = function(){
		active = false
	}


}]