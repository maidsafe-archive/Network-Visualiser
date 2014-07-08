var mongoose = require('mongoose');
var utils = require('./../maidsafe/utils.js');

var KeyValueStorage = function(dbConnection) {

  var SCHEMA, KeyValueData, MODEL_NAME;
  var beginDate;
  SCHEMA = {
    key: String,
    value: String
  };
  MODEL_NAME = 'keyValueData';
  KeyValueData = mongoose.model(MODEL_NAME, new mongoose.Schema(SCHEMA), MODEL_NAME);
  utils.ensureUniqueDocInMongo(dbConnection, MODEL_NAME, 'key');

  this.clearBeginDate = function() {
    beginDate = null;
  };
  this.getBeginDateString = function() {
    return beginDate != null ? beginDate.toISOString() : new Date().toISOString();
  };
  this.checkAndUpdateBeginDate = function(newTimeString) { // ISO string
    var promise = new mongoose.Promise;
    var newDate = new Date(newTimeString);
    if (beginDate != null && beginDate.getTime() < newDate.getTime()) {
      console.log('returned');
      promise.complete('');
    } else {
      KeyValueData.update({ key: 'beginDate' }, { $set: { value: newDate.toISOString() } }, { upsert: true }, function(err, doc) {
        if (err) {
          promise.error(err);
        } else {
          console.log('updated initial time');
          beginDate = newDate;
          promise.complete('');
        }
      });
    }

    return promise;
  };
  var getBeginDateFromDB = function() {
    KeyValueData.find({ key: 'beginDate' }, function(err, doc) {
      if (!err && doc.length != 0) {
        beginDate = new Date(doc[0].value);
      }
    });
  };
  getBeginDateFromDB();
  return this;
};
exports.KeyValueStorage = KeyValueStorage;