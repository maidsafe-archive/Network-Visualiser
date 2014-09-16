/*jshint expr: true*/

var assert = require('assert');
var bridge = require('../backend/mongo/bridge');
var should = require('should');
var config = require('../Config');

describe('MongoDB Test Suite', function() {
  it('Connection to mongodb', function(done) {
    bridge.setupMongooseConnection(done, (config.Constants.mongoCon + '_test'));
  });
});
