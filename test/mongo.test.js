var assert = require('assert');
var bridge = require('../backend/mongo/bridge');
var config = require('../Config');

suite('MongoDB Test Suite', function() {

  test('Connection test', function() {
    var connectionCallback = function(connected) {
      assert.equal(true, connected);
    };
    bridge.setupMongooseConnection(connectionCallback, (config.Constants.mongoCon + '_test'));
  });

});
