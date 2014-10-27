var queuePool = {};
var consumer;
var SessionQueue = function() {
  var msg;
  var instance = this;
  var queue = [];
  var STATE = {
    START: 0,
    STOP: 1
  };
  var currentState = STATE.STOP;
  var DoneCallback;
  var broadcast;
  var onReceived;
  broadcast = function() {
    if (consumer) {
      msg = queue.shift();
      if (msg) {
        consumer(JSON.parse(msg), new DoneCallback());
      }
    }
  };
  DoneCallback = function() {
    var timerId;
    var timerDuration = 30000;
    var completed = false;
    var completedCallback = function() {
      clearTimeout(timerId);
      if (!completed) {
        completed = true;
        currentState = STATE.STOP;
        broadcast();
      }
    };
    timerId = setTimeout(function() {
      completedCallback();
      console.error('%s Queue was restarted forcefully - done callback was not completed in %d ms',
        new Date().toISOString(), timerDuration);
    }, timerDuration);
    return completedCallback;
  };
  onReceived = function() {
    if (currentState === STATE.STOP) {
      currentState = STATE.START;
      broadcast();
    }
  };
  instance.pushToQueue  = function(log) {
    queue.push(JSON.stringify(log));
    onReceived();
  };
  return instance;
};
exports.pushToQueue = function(log) {
  if (!queuePool[log.sessionId]) {
    queuePool[log.sessionId] = new SessionQueue();
  }
  queuePool[log.sessionId].pushToQueue(log);
};
exports.deleteQueue = function(sessionId) {
  return delete queuePool[sessionId];
};
exports.subscribe = function(con) {
  consumer = con;
};
