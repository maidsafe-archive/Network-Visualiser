/* global window:false */
window.PlayerService = [
  '$filter', 'playBackService', function($filter, playBackService) {
    var instance = this;
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
    var statusChangeListner;
    var buffering;
    var onSnapShotChange;
    var startTime;
    var sessionName;
    var scope;
    var tempRangeUpdateCounter = 0;
    var lastRangeTime = 0;
    instance.STATE = { PLAY: 0, STOP: 1, PAUSE: 2 };
    instance.currentState = instance.STATE.STOP;
    instance.playerUI = { maxSteps: 1000, currentPlayTime: 0, currentPlayState: 0 };
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
      populateTimePool(data);
      sortTimePool();
      if (!timerId) {
        start();
      }
    };
    var start = function() {
      instance.currentState = instance.STATE.PLAY;
      timerId = setInterval(pushLogs, SPEED);
    };
    var PushWrapper = function(log) {
      this.push = function() {
        console.log(log);
        // dataManager.pushLog(log);
      };
    };
    var initializeListeners = function() {
      scope.$watch('player.playerUI.currentPlayState', function(newValue, oldValue) {
        instance.playerUI.currentPlayTime = startTime +  (newValue * 1000);
        console.log(newValue);
        // if (newValue  === (lastRangeTime + 1) || (newValue === 0 && oldValue === 0)) {
        //  return;
        // }
        // instance.stop();
        // switch (instance.currentState) {
        //  case instance.STATE.PLAY:
        //    instance.play(new Date(instance.playerUI.currentPlayTime).toISOString());
        //    break;
        //  case instance.STATE.PAUSE:
        //    break;
        //  case instance.STATE.STOP:
        //    break;
        // };
      });
    };
    var pushLogs = function() {
      instance.playerUI.currentPlayState += 1;
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
          var min = lastBufferedTime;
          lastBufferedTime += (BUFFER_MINUTES * 60000);
          playBackService.getBufferedData(sessionName,
            new Date(min).toISOString(), new Date(lastBufferedTime).toISOString())
            .then(prepareData, onNetworkError);
        }
      }
    };
    var updateNextPushTime = function() {
      if (playEndsAt < nextPushTime) {
        this.stop();
        return;
      }
      nextPushTime += SPEED;
      loadBuffer();
    };
    instance.play = function(time) {// pass time as an ISO string
     // playEndsAt = new Date().getTime();
      instance.currentState = instance.STATE.PLAY;
      time = time || new Date(startTime).toISOString();
      clearAll();
      nextPushTime = new Date(time).getTime();
      playBackService.getSnapShot(sessionName, time).then(function(data) {
        if (!onSnapShotChange) {
          console.error('Set Snapshot Callback before getting Snapshot');
          return;
        }
        onSnapShotChange(data);
        lastBufferedTime = startTime + (BUFFER_MINUTES * 60000);
        var bufferData = playBackService.getBufferedData(sessionName, new Date(startTime).toISOString(),
          new Date(lastBufferedTime).toISOString());
        if (bufferData) {
          bufferData.then(prepareData, onNetworkError);
        }
      }, onNetworkError);
    };
    instance.init = function(sn, $scope) {
      sessionName = sn;
      scope = $scope;
      playBackService.getTimeLineData(sessionName, function(err, data) {
        if (err) {
          onNetworkError(err);
          return;
        }
        startTime = new Date(data.startTime).getTime() - 1000;
        playEndsAt = (data.endTime ? data.endTime : new Date().getTime()) + 10000;
        instance.playerUI = {
          currentPlayTime: startTime, maxSteps: Math.ceil((playEndsAt - startTime) / 1000),
           currentPlayState: 0
        };
      });
      initializeListeners();
    };
    instance.pause = function() {
      instance.currentState = instance.STATE.PAUSE;
      clearInterval(timerId);
    };
    instance.resume = function() {
      start();
    };
    instance.stop = function() {
      clearAll();
      instance.currentState = instance.STATE.STOP;
    };
    instance.onStatusChange = function(callback) {
      statusChangeListner = callback;
    };
    instance.onSnapShotChange = function(handler) {
      onSnapShotChange = handler;
    };
  }
];
