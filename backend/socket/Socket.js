var socket_io = require('socket.io')

/********** CONSTANTS - BEGIN *********************/
var LOG_CHANNEL_NAME = "log";//channel for sending the log notifications
var SOCKET_LISTEN_PORT = 8081;//port for socket connection
var LOG_LEVEL = 0;// 0 - ERROR, 1 - WARN, 2- INFO, 3 - DEBUG
/********** CONSTANTS - END *********************/
var SOCKET_IO_CONFIG = {'log level': LOG_LEVEL}//More info - https://github.com/LearnBoost/Socket.IO/wiki/Configuring-Socket.IO


io = socket_io.listen(SOCKET_LISTEN_PORT, SOCKET_IO_CONFIG);

io.sockets.on('connection', function (socket) {});

exports.broadcastLog = function(data){
	io.sockets.emit(LOG_CHANNEL_NAME, data);
}