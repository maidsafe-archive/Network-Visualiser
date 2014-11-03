/* global window:false */
window.PlaybackDataService = [ '$http', function($http) {
  var instance = this;
  var timeLineData;
  var snapShotHandler;
  var bufferedDataHandler;
  var setSnapShotHandler = function(handler) {
    snapShotHandler = handler;
  };
  var getSnapShot = function(sessionName, timestamp) {
    if (!snapShotHandler) {
      console.error('Snapshot could not be fetched - Snapshot handler not initialized');
      return;
    }
    return snapShotHandler(sessionName, timestamp);
  };
  var setBufferedDataHandler = function(handler) {
    bufferedDataHandler = handler;
  };
  var getBufferedData = function(sessionName, minTime, maxTime) {
    if (!setBufferedDataHandler) {
      console.error('Buffered Data could not be fetched - Buffered Data handler not initialized');
      return;
    }
    return bufferedDataHandler(sessionName, minTime, maxTime);
  };
  var getTimeLineData = function(sessionName, callback) {
    timeLineData = {};
    $http.get('/backend/timelineDates?sn=' + sessionName).then(function(res) {
      timeLineData.startTime = new Date(res.data.beginDate).getTime() - 1000;
      var maxDate = res.data.endDate ? new Date(res.data.endDate) : new Date();
      timeLineData.endTime = maxDate.getTime() + 10000;
      callback(null, timeLineData);
    }, callback);
  };
  instance.setSnapShotHandler = setSnapShotHandler;
  instance.getSnapShot = getSnapShot;
  instance.getBufferedData = getBufferedData;
  instance.setBufferedDataHandler = setBufferedDataHandler;
  instance.getTimeLineData = getTimeLineData;
} ];
