var ActualConnectionHandler = require('./ActualConnection');
var MongoBridge = function() {
  var instance = this;
  var dbCon;
  var actualConnection;
  instance.setDB = function(db) {
    dbCon = db;
    actualConnection = new ActualConnectionHandler(db);
  };
  instance.addActualLog = function(log, callback) {
    return actualConnection.save(log, callback);
  };
  instance.updateExpected = function(log, promise) {
    // TODO handle and save the log
    return promise;
  };
  return instance;
};
exports.bridge = new MongoBridge();
