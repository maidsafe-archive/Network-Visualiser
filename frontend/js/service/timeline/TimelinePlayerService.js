/* global window:false */

window.PlayerService = [
  '$filter', '$timeout', 'playBackService', function($filter, $timeout, playBackService) {
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
    var statusChangeListener;
    var buffering;
    var onSnapShotChange;
    var startTime;
    var sessionName;
    var pushLogHandler;
    var lastRangeTime = -1;
    var autoSeekIntervalPromise;
    var didSeekOnPauseState = false;
    instance.showProgress = false;
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
    var prepareData = function(data) {
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
    var initializeListeners = function(scope, variableToWatch) {
      var SeekHandler = function(time, rangeValue) {
        if (autoSeekIntervalPromise) {
          $timeout.cancel(autoSeekIntervalPromise);
          autoSeekIntervalPromise = null;
        }
        autoSeekIntervalPromise = $timeout(function() {
          instance.stop();
          instance.playerUI.currentPlayState = rangeValue;
          instance.play(time);
        }, 1000);
      };
      scope.$watch(function() {
        return variableToWatch.playerUI.currentPlayState;
      }, function(newValue, oldValue) {
        instance.playerUI.currentPlayTime = startTime +  (newValue * 1000);
        if (newValue  === (lastRangeTime + 1) || (newValue === 0 && oldValue === 0)) {
          lastRangeTime += 1;
          return;
        }
        lastRangeTime = newValue;
        switch (instance.currentState) {
          case instance.STATE.PLAY:
            new SeekHandler(instance.playerUI.currentPlayTime, newValue);
            break;
          case instance.STATE.PAUSE:
            didSeekOnPauseState = true;
            break;
          case instance.STATE.STOP:
            break;
        }
      });
    };
    var pushLogs = function() {
      instance.playerUI.currentPlayState += 1;
      var logs = timePool[getDateKey(new Date(nextPushTime + 1000).toISOString())];
      var updateNextPushTime = function() {
        if (playEndsAt < nextPushTime) {
          instance.stop();
          return;
        }
        nextPushTime += SPEED;
        loadBuffer();
      };
      var PushWrapper = function(log) {
        this.push = function() {
          if (pushLogHandler) {
            pushLogHandler(log);
          }
        };
        return this.push;
      };
      if (logs && logs.length > 0) {
        for (var index in logs) {
          if (logs[index]) {
            setTimeout(new PushWrapper(logs[index]), 1);
          }
        }
      }
      updateNextPushTime();
    };

    /*jshint forin:true */
    /*jshint unused:true */
    var loadBuffer = function() {
      var condition;
      /*jshint unused:false */
      /*jshint forin:false */
      var isEmpty = function(obj) {
        for (var o in obj) {
          return false;
        }
        return true;
      };
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
    instance.play = function(time) {
      time = time || instance.playerUI.currentPlayTime || startTime;
      instance.currentState = instance.STATE.PLAY;
      instance.showProgress = true;
      clearAll();
      nextPushTime = time;
      playBackService.getSnapShot(sessionName, new Date(time).toISOString()).then(function(data) {
        if (!onSnapShotChange) {
          console.error('Set Snapshot Callback before getting Snapshot');
          return;
        }
        onSnapShotChange(data);
        instance.playerUI.currentPlayTime = time;
        lastBufferedTime = time + (BUFFER_MINUTES * 60000);
        var bufferData = playBackService.getBufferedData(sessionName, new Date(time).toISOString(),
          new Date(lastBufferedTime).toISOString());
        if (bufferData) {
          bufferData.then(function(data) {
            instance.showProgress = false;
            prepareData(data);
          }, onNetworkError);
        }
      }, onNetworkError);
    };
    instance.init = function(sn, $scope, scopePlayerVariable) {
      sessionName = sn;
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
      initializeListeners($scope, scopePlayerVariable);
    };
    instance.pause = function() {
      instance.currentState = instance.STATE.PAUSE;
      clearInterval(timerId);
    };
    instance.resume = function() {
      if (!didSeekOnPauseState) {
        start();
        return;
      }
      didSeekOnPauseState = false;
      clearAll();
      instance.play(instance.playerUI.currentPlayTime);
    };
    instance.stop = function() {
      clearAll();
      instance.playerUI.currentPlayTime = startTime;
      instance.playerUI.currentPlayState = 0;
      instance.currentState = instance.STATE.STOP;
    };
    instance.onStatusChange = function(callback) {
      statusChangeListener = callback;
    };
    instance.onSnapShotChange = function(handler) {
      onSnapShotChange = handler;
    };
    instance.setPushLogHandler = function(handler) {
      pushLogHandler = handler;
    };
  }
];
