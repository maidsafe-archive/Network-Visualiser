var SocketService = ['$rootScope', function($rootScope){
	
	var socket = io.connect($rootScope.socketEndPoint);
	socket.on('log', function (data) {
		    $rootScope.$broadcast('push', data);		    
	});	
}]