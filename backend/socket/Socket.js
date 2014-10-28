var config = require('./../../Config.js');
var sessionMapper = require('./SessionMapper');
/********** CONSTANTS - BEGIN *********************/
var LOG_CHANNEL_NAME = 'log'; // channel for sending the log notifications
var SIGNAL_CHANNEL_NAME = 'signal'; // channel for sending the signal notifications
var TESTNET_STATUS_UPDATE_NAME = 'testnet_status_update';
var SOCKET_LISTEN_PORT = config.Constants.socketPort; // port for socket connection
var LOG_LEVEL = 0; // 0 - ERROR, 1 - WARN, 2- INFO, 3 - DEBUG
/********** CONSTANTS - END *********************/
// More info - https://github.com/LearnBoost/Socket.IO/wiki/Configuring-Socket.IO
var SOCKET_IO_CONFIG = { 'log level': LOG_LEVEL };
var io = require('socket.io').listen(SOCKET_LISTEN_PORT, SOCKET_IO_CONFIG);
io.sockets.on('connection', function(socket) {
  socket.on('channel', function(sessionName) {
    if (!sessionName) {
      return;
    }
    socket.session = sessionName;
    socket.join(sessionName);
    sessionMapper.add(sessionName);
  });
  socket.on('disconnect', function() {
    socket.leave(socket.session);
  });
});
exports.broadcastLog = function(data) {
  var channelName = data.sessionName ? data.sessionName : sessionMapper.getSessionName(data.sessionId);
  if (!channelName) {
    return;
  }
  io.sockets.to(channelName).emit(LOG_CHANNEL_NAME, data);
};
exports.broadcastSignal = function(data) {
  io.sockets.emit(SIGNAL_CHANNEL_NAME, data);
};
exports.broadcastTestnetStatusUpdate = function(data) {
  io.sockets.emit(TESTNET_STATUS_UPDATE_NAME, data);
};
console.log('socket listening on ' + SOCKET_LISTEN_PORT);
