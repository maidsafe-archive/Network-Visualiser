var sq = require('simplequeue');
var queue = sq.createQueue();
var msg;
var STATE = {
  START: 0,
  STOP: 1
};
var currentState = STATE.STOP;
var consumer;
var DoneCallback;
var broadcast;
var onReceived;
broadcast = function() {
  msg = queue.getMessageSync();
  if (msg) {
    consumer(msg, new DoneCallback());
  }
  currentState = STATE.STOP;
};
DoneCallback = function() {
  var timerId;
  var timerDuration = 2000;
  var completed = false;
  var done = function() {
    clearTimeout(timerId);
    if (!completed) {
      completed = true;
      broadcast();
    }
  };
  timerId = setTimeout(function() {
    done();
    console.error('%s Queue was restarted forcefully - done callback was not completed in 2000ms',
      new Date().toISOString());
  }, timerDuration);
  return done;
};
onReceived = function() {
  if (currentState === STATE.STOP) {
    currentState = STATE.START;
    broadcast();
  }
};
exports.pushToQueue = function(obj) {
  queue.putMessage(obj);
  onReceived();
};
exports.subscribe = function(con) {
  consumer = con;
};
