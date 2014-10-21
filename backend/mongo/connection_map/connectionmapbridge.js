var mongoose = require('mongoose');
var MongoBridge = function() {
  var instance = this;
  var db;

  instance.setDB = function(dbCon) {
    db = dbCon;
  };
  instance.addActualLog = function(log, callback) {
    var promise = new mongoose.Promise();
    if (callback) {
      promise.addBack(callback);
    }
    // TODO handle and save the log
    setTimeout(function() {
      promise.complete('Connection Map Saved');
    }, 1000);
    return promise;
  };
  instance.updateExpected = function(log, promise) {
    // TODO handle and save the log
    return promise;
  };
  return instance;
};
exports.bridge = new MongoBridge();
