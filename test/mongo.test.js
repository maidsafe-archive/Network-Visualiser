/*jshint expr: true*/

var bridge = require('../backend/mongo/bridge');
var config = require('../Config');

describe('MongoDB Test Suite', function() {
  it('Connection to mongodb', function(done) {
    bridge.setupMongooseConnection(done, (config.Constants.mongoCon + '_test'));
  });
});
