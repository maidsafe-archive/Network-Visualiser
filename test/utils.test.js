/*jshint expr: true*/

var should = require('should'); // jshint ignore:line
var utils = require('../backend/maidsafe/utils');

describe('Utils Test Suite', function() {
  it('Is Object Empty', function() {
    utils.isEmptyObject({}).should.be.true;
    utils.isEmptyObject(null).should.be.true;
    utils.isEmptyObject({ d: 10 }).should.be.false;
    utils.isEmptyObject([]).should.be.true;
    utils.isEmptyObject([ 1 ]).should.be.false;
  });
  it('Should be able to transform old format to cameCase for log', function() {
    var log = { 'vault_id': 'aaa..bbb', 'session_id': 'gjhjhjhfg80987676', 'action_id': 0, 'vaule1': '' };
    utils.prepareLogModel(log);
    log.hasOwnProperty('vaultId').should.be.ok;
    log.hasOwnProperty('vault_id').should.not.be.ok;
  });
});
