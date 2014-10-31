/* global window:false */
window.ConnectionMapDataService = [
  '$http', '$q', function($http, $q) {
    var instance = this;
    var getConnectionMapSnapshot = function(sessionName, timestamp) {
      if (!sessionName) {
        console.error('SessionName is mandatory');
        return;
      }
      var deferred = $q.defer();
      var url = '/connectionMapSnapshot?sn=' + sessionName;
      if (timestamp) {
        url += '&ts=' + timestamp;
      }
      $http.get(url).success(deferred.resolve).error(deferred.reject);
      return deferred.promise;
    };
    var getConnectionMapDiff = function(sessionName, minTime, maxTime) {
      if (!sessionName || !minTime || !maxTime) {
        console.error('All parameters are mandatory');
        return;
      }
      var deferred = $q.defer();
      $http.get('/connectionMapDiff?sn=' + sessionName + '&min=' + minTime + '&max=' + maxTime)
        .success(deferred.resolve).error(deferred.reject);
      return deferred.promise;
    };
    var getTimelineRange = function(sessionName) {
      if (!sessionName) {
        console.error('SessionName is mandatory');
        return;
      }
      var deferred = $q.defer();
      $http.get('/backend/timelineDates?sn=' + sessionName).success(deferred.resolve).error(deferred.reject);
      return deferred.promise;
    };
    instance.getConnectionMapSnapshot = getConnectionMapSnapshot;
    instance.getConnectionMapDiff = getConnectionMapDiff;
    instance.getTimelineRange = getTimelineRange;

    return instance;
  }
];
