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
    var log = { 'vault_id': 'aaa..bbb', 'session_id': 'gjhjhjhfg80987676', 'action_id': 0, 'value1': '' };
    utils.prepareLogModel(log);
    log.hasOwnProperty('vaultId').should.be.ok;
    log.hasOwnProperty('vault_id').should.not.be.ok;
  });
  it('Validate log - Should not thrown an error for valid log', function() {
    var log = {
      vaultId: 'aaa..bbb', sessionId: 'gjhjhjhfg80987676',
      actionId: 10, personaId: 10 , value1: '787987',
      'ts': '2014-10-10 03:32:09.350'
    };
    should(utils.assertLogModelErrors(log)).not.be.ok;
  });
  it('Validate log - Should thrown an error for invalid action id', function() {
    var log = {
      vaultId: 'aaa..bbb', sessionId: 'gjhjhjhfg80987676', actionId: 20, personaId: 10, value1: '787987',
      'ts': '2014-10-10 03:32:09.350'
    };
    should(utils.assertLogModelErrors(log)).be.ok;
  });
  it('Validate log - Should thrown an error for empty value1', function() {
    var log = {
      vaultId: 'aaa..bbb', sessionId: 'gjhjhjhfg80987676', actionId: 0, personaId: 10, value1: '',
      'ts': '2014-10-10 03:32:09.350'
    };
    should(utils.assertLogModelErrors(log)).be.ok;
  });
  it('Validate Log - action Id must be a proper integer', function() {
    var log = {
      vaultId: 'aaa..bbb', sessionId: 'gjhjhjhfg80987676', actionId: 'sdf', personaId: 10, value1: '787987',
      'ts': '2014-10-10 03:32:09.350'
    };
    should(utils.assertLogModelErrors(log)).be.ok;
  });
  it('Validate Log - Persona Id must be a proper integer', function() {
    var log = {
      vaultId: 'aaa..bbb', sessionId: 'gjhjhjhfg80987676', actionId: 10, personaId: 'sdf', value1: '787987',
      'ts': '2014-10-10 03:32:09.350'
    };
    should(utils.assertLogModelErrors(log)).be.ok;
  });
  it('Validate Log - Value1 must be a integer for action Id 17', function() {
    var log = {
      vaultId: 'aaa..bbb', sessionId: 'gjhjhjhfg80987676', actionId: 17, personaId: 10, value1: 'g89',
      'ts': '2014-10-10 03:32:09.350'
    };
    should(utils.assertLogModelErrors(log)).be.ok;
  });
  it('Validate Log - Should throw error if required fields are missing', function() {
    var log = {
      vaultId: 'aaa..bbb', sessionId: 'gjhjhjhfg80987676', actionId: 17, personaId: 10, value1: '89',
      'ts': '2014-10-10 03:32:09.350'
    };
    should(utils.assertLogModelErrors(log)).not.be.ok;
    log = { vaultId: 'aaa..bbb', sessionId: 'gjhjhjhfg80987676', actionId: 17, personaId: 10, value1: '89' };
    should(utils.assertLogModelErrors(log)).be.ok;
  });
  it('Validate Log - should throw error if vaultId parameter is not present', function() {
    var log = {
      vaultId: '', sessionId: 'gjhjhjhfg80987676', actionId: 17, personaId: 10, value1: '89',
      'ts': '2014-10-10 03:32:09.350'
    };
    should(utils.assertLogModelErrors(log)).be.ok;
    log = {
      vaultId: null, sessionId: 'gjhjhjhfg80987676', actionId: 17, personaId: 10, value1: '89',
      'ts': '2014-10-10 03:32:09.350'
    };
    should(utils.assertLogModelErrors(log)).be.ok;
    log = {
      sessionId: 'gjhjhjhfg80987676', actionId: 17, personaId: 10, value1: '89',
      'ts': '2014-10-10 03:32:09.350'
    };
    should(utils.assertLogModelErrors(log)).be.ok;
    log = {
      vaultId: 'sdsd', sessionId: 'gjhjhjhfg80987676', actionId: 17, personaId: 10, value1: '89',
      'ts': '2014-10-10 03:32:09.350'
    };
    should(utils.assertLogModelErrors(log)).not.be.ok;
  });
  it('Validate Log - should throw error if sessionId parameter is not present', function() {
    var log = {
      vaultId: 'sds', sessionId: '', actionId: 17, personaId: 10, value1: '89',
      'ts': '2014-10-10 03:32:09.350'
    };
    should(utils.assertLogModelErrors(log)).be.ok;
    log = {
      vaultId: null, sessionId: null, actionId: 17, personaId: 10, value1: '89', 'ts': '2014-10-10 03:32:09.350'
    };
    should(utils.assertLogModelErrors(log)).be.ok;
    log = {
      vaultId: 'gjhjhjhfg80987676', actionId: 17, personaId: 10, value1: '89',  'ts': '2014-10-10 03:32:09.350'
    };
    should(utils.assertLogModelErrors(log)).be.ok;
    log = {
      vaultId: 'sdsd', sessionId: 'gjhjhjhfg80987676', actionId: 17, personaId: 10, value1: '89',
      'ts': '2014-10-10 03:32:09.350'
    };
    should(utils.assertLogModelErrors(log)).not.be.ok;
  });
});
