var db;
var config = require('../../test/Config');
var mongoose = require('mongoose');

var dropDatabase = function() {
  db.db.dropDatabase();
};

var closeConnection = function() {
  mongoose.disconnect();
};

var openConnection = function(callback) {
  mongoose.connect(config.Constants.mongoCon, function(connectionError) {
    if (connectionError) {
      callback(connectionError);
      return;
    }
    db = mongoose.connection;
    db.on('error', function() {
      console.error.bind(console, 'connection error:');
    });
    callback();
  });
};

var closeAndDropDB = function() {
  dropDatabase();
  closeConnection();
};

var getDB = function() {
  return db;
};

exports.closeAndDropDB = closeAndDropDB;
exports.closeConnection = closeConnection;
exports.dropDatabase = dropDatabase;
exports.getDB = getDB;
exports.openConnection = openConnection;
