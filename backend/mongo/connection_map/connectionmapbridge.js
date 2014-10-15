var mongoose = require('mongoose');
var MongoBridge = function() {
  var instance = this;
  var dbCon;
  instance.setDB = function(db) {
    dbCon = db;
  };
  instance.addActualLog = function(log, callback) {
    var promise = new mongoose.Promise();
    if (callback) {
      promise.addBack(callback);
    }
    return promise;
  };
  instance.updateExpected = function(log, promise) {
    // TODO handle and save the log
    return promise;
  };
  return instance;
};
exports.bridge = new MongoBridge();
