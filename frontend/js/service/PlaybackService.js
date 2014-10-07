/* global window:false */
window.PlaybackService = [
  '$rootScope', '$http', '$filter', 'dataManager', function($rootScope, $http, $filter, dataManager) {
    var timerId = 0;
    var nextPushTime;
    var playEndsAt;
    var timePool;
    var SPEED = 1000;
    var BUFFER_MINUTES = 1;
    var lastBufferedTime;
    var bufferMonitor = 0;
    var firstBuffer = true;
    var bufferPool = {};
    var status = { playing: 0, stopped: 1, pause: 2, resume: 3 };
    var playerStatus = '';
    var statusChangeListner;
    var buffering;
    var onNetworkError = function(err) {
      buffering = false;
      console.error(err.data);
    };
    var getDateKey = function(timestamp) {
      return timestamp.substr(0, 19); // from the ISO string trim out the milliseconds part
    };
    var clearAll = function() {
      clearInterval(timerId);
      timerId = null;
      timePool = null;
      bufferMonitor = 0;
      firstBuffer = true;
      bufferPool = {};
    };
    var setPlayerStatus = function(status) {
      playerStatus = status;
      statusChangeListner(playerStatus);
    };
    var populateTimePool = function(history) {
      var key;
      var log;
      var addLog = function(vaultLogs) {
        for (var index in vaultLogs) {
          if (vaultLogs[index]) {
            log = vaultLogs[index];
            key = getDateKey(log.ts);
            if (!bufferPool.hasOwnProperty(key)) {
              bufferPool[key] = [];
            }
            bufferPool[key].push(log);
          }
        }
      };

      for (var vault in history) {
        if (history[vault]) {
          addLog(history[vault]);
        }
      }
    };
    // sorting by id to arrange in the same sequence order of receiving the logs
    var sortTimePool = function() {
      for (var key in bufferPool) {
        if (bufferPool[key]) {
          bufferPool[key] = $filter('orderBy')(bufferPool[key], '-__id');
        }
      }
      if (!timePool) {
        timePool = bufferPool; // setPlayerStatus("Ready to play")
        bufferPool = {};
      } else {
        for (var bKey in bufferPool) {
          if (bufferPool[bKey]) {
            timePool[bKey] = bufferPool[bKey];
          }
        }
        bufferPool = {};
      }
    };
    var prepareData = function(data) {
      buffering = false;
      populateTimePool(data.data);
      sortTimePool();
      if (!timerId) {
        start();
      }
    };
    var start = function() {
      timerId = setInterval(pushLogs, SPEED);
    };
    var PushWrapper = function(log) {
      this.push = function() {
        dataManager.pushLog(log);
      };
    };
    var pushLogs = function() {
      setPlayerStatus(status.playing);
      var logs = timePool[getDateKey(new Date(nextPushTime).toISOString())];
      if (logs && logs.length > 0) {
        for (var index in logs) {
          if (logs[index]) {
            setTimeout(new PushWrapper(logs[index]).push, 1);
          }
        }
      }
      updateNextPushTime();
    };
    /*jshint unused:false */
    /*jshint forin:false */
    var isEmpty = function(obj) {
      for (var o in obj) {
        return false;
      }
      return true;
    };
    /*jshint forin:true */
    /*jshint unused:true */
    var loadBuffer = function() {
      var condition;
      if (firstBuffer) {
        condition = (BUFFER_MINUTES * 60) / 4;
      } else {
        condition = BUFFER_MINUTES * 60;
      }
      bufferMonitor++;
      if (bufferMonitor === condition) {
        firstBuffer = false;
        bufferMonitor = 0;
        if (isEmpty(bufferPool) && !buffering) {
          buffering = true;
          lastBufferedTime += (BUFFER_MINUTES * 60000);
          $http.get('/backend/selectLogs?offset=' + BUFFER_MINUTES + '&ts=' + new Date(lastBufferedTime).toISOString() +
            '&sn=' + $rootScope.sessionName).then(prepareData, onNetworkError);
        }
      }
    };
    var updateNextPushTime = function() {
      if (playEndsAt < nextPushTime) {
        this.stop();
      } else {
        nextPushTime += SPEED;
      }
      loadBuffer();
    };
    this.play = function(time) {
      playEndsAt = new Date().getTime();
      clearAll();
      nextPushTime = new Date(time).getTime();
      lastBufferedTime = nextPushTime;
      $http.get('/backend/selectLogs?offset=' + BUFFER_MINUTES + '&ts=' + time + '&sn=' +
        $rootScope.sessionName).then(prepareData, onNetworkError);
    };
    this.pause = function() {
      setPlayerStatus(status.pause);
      clearInterval(timerId);
    };
    this.resume = function() {
      start();
    };
    this.stop = function() {
      clearAll();
      setPlayerStatus(status.stopped);
    };
    this.onStatusChange = function(callback) {
      statusChangeListner = callback;
    };
  }
];
