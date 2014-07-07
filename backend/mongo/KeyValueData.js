var mongoose = require('mongoose');

var KeyValueStorage = function() {

  var SCHEMA, KeyValueData, MODEL_NAME;
  var firstLogTime;
  SCHEMA = {
    key: String,
    value: String
  };
  MODEL_NAME = 'keyValueData';
  KeyValueData = mongoose.model(MODEL_NAME, new mongoose.Schema(SCHEMA), MODEL_NAME);

  this.clearFirstLogTime = function() {
    firstLogTime = null;
  };
  this.getFirstLogTime = function() {
    return firstLogTime || new Date().toISOString();
  };
  this.setFirstLogTime = function(firstLogTimeISO) { // ISO string
    firstLogTime = firstLogTimeISO;
    new KeyValueData({ key: 'firstLogTime', value: firstLogTimeISO }).save(function(err, doc) {
      if (err) {
        console.log(err);
      }
    });
    console.log(firstLogTime);
  };
  var setFirstLogTimeFromDB = function() {
    KeyValueData.find({ key: 'firstLogTime' }, function(err, doc) {
      if (!err && !doc.length == 0) {
        firstLogTime = doc[0].value;
        console.log(firstLogTime);
      }
    });
  };
  setFirstLogTimeFromDB();
  return this;
};
exports.KeyValueStorage = KeyValueStorage;