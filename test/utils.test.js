/*jshint expr: true*/

var should = require('should'); // jshint ignore:line
var utils = require('../backend/maidsafe/utils');

describe('Utils Test Suite', function() {
  it('Is Object Empty', function() {
    utils.isEmptyObject({}).should.be.true;
    utils.isEmptyObject(null).should.be.true;
    utils.isEmptyObject({d: 10}).should.be.false;
    utils.isEmptyObject([]).should.be.true;
    utils.isEmptyObject([1]).should.be.false;
  });
});
