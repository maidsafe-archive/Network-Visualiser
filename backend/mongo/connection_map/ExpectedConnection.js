module.exports = function() {
  var MongoosePromise = require('mongoose').Promise;
  var instance = this;
//  var COLLECTION_NAME_SUFFIX = '_expected_connection';
//  var GeneralHandler = function(promise) {
//    return function(err, doc) {
//      if (err) {
//        promise.error(err);
//        return;
//      }
//      promise.complete(doc);
//    };
//  };
  var updateExpectedConnection = function(log, callback) {
    var promise = new MongoosePromise();
    if (callback) {
      promise.addBack(callback);
    }
    setTimeout(function() {
      console.log(log);
      promise.complete('Expected Connection');
    }, 1000);
    return promise;
  };
  instance.updateExpectedConnection = updateExpectedConnection;
  return instance;
};
