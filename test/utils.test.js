/*jshint expr: true*/

var should = require('should'); // jshint ignore:line
var utils = require('../backend/maidsafe/utils');
var config = require('../Config.js');
var validationMsg = config.ValidationMsg;

describe('Utils Test Suite', function() {
  it('Is Object Empty', function() {
    utils.isEmptyObject({}).should.be.true;
    utils.isEmptyObject(null).should.be.true;
    utils.isEmptyObject({ d: 10 }).should.be.false;
    utils.isEmptyObject([]).should.be.true;
    utils.isEmptyObject([ 1 ]).should.be.false;
  });
//  it('Should be able to transform old format to cameCase for log', function() {
//    var log = { 'vault_id': 'aaa..bbb', 'session_id': 'gjhjhjhfg80987676', 'action_id': 0, 'valueOne': '' };
//    utils.prepareLogModel(log);
//    log.hasOwnProperty('vaultId').should.be.ok;
//    log.hasOwnProperty('vault_id').should.not.be.ok;
//  });
  it('Validate log - Should not thrown an error for valid log', function() {
    var log = {
      vaultId: 'aaa..bbb', sessionId: 'gjhjhjhfg80987676',
      actionId: 10, personaId: 10 , valueOne: '787987',
      'ts': '2014-10-10 03:32:09.350'
    };
    should(utils.assertLogModelErrors(log)).not.be.ok;
  });
  it('Validate log - Should thrown an error for invalid action id', function() {
    var log = {
      vaultId: 'aaa..bbb', sessionId: 'gjhjhjhfg80987676', actionId: 20, personaId: 10, valueOne: '787987',
      'ts': '2014-10-10 03:32:09.350'
    };
    should(utils.assertLogModelErrors(log)).be.ok;
  });

  it('Validate Log - Should throw an error if Action Id is not a proper integer', function() {
    var log = {
      vaultId: 'aaa..bbb', actionId: 'sdf', sessionId: 'gjhjhjhfg80987676', personaId: 10, valueOne: '89',
      'ts': '2014-10-10 03:32:09.350'
    };
    utils.assertLogModelErrors(log).should.containEql(validationMsg.ACTION_ID_NOT_A_NUMBER);
  });

  it('Validate Log - Should throw an error if Network Health value is not a proper integer', function() {
    var log = {
      vaultId: 'aaa..bbb', sessionId: 'gjhjhjhfg80987676', actionId: 17, personaId: 10, valueOne: 'styj',
      'ts': '2014-10-10 03:32:09.350'
    };
    utils.assertLogModelErrors(log).should.containEql(validationMsg.NETWORK_HEALTH_MUST_BE_INTEGER);
  });

  it('Validate Log - Should throw an error if Session ID is empty', function() {
    var log = {
      vaultId: 'aaa..bbb', sessionId: '', actionId: 12, personaId: 10, valueOne: '89',
      'ts': '2014-10-10 03:32:09.350'
    };
    utils.assertLogModelErrors(log).should.containEql(validationMsg.SESSIONID_CANNOT_BE_EMPTY);
  });

  it('Validate Log - Should throw an error if valueOne is empty', function() {
    var log = {
      vaultId: 'aaa..bbb', sessionId: 'gjhjhjhfg80987676', actionId: 13, personaId: 10, valueOne: '',
      'ts': '2014-10-10 03:32:09.350'
    };
    utils.assertLogModelErrors(log).should.containEql(validationMsg.VALUE_ONE_CANNOT_BE_EMPTY);
  });

  it('Validate Log - Should throw an error if Vault ID is empty', function() {
    var log = {
      vaultId: '', sessionId: 'gjhjhjhfg80987676', actionId: 13, personaId: 10, valueOne: '89',
      'ts': '2014-10-10 03:32:09.350'
    };
    utils.assertLogModelErrors(log).should.containEql(validationMsg.VAULTID_CANNOT_BE_EMPTY);
  });

  it('Validate Log - Should throw an error if Action ID not in range', function() {
    var  log = {
      vaultId: 'aaa..bbb', sessionId: 'gjhjhjhfg80987676', actionId: 20, personaId: 10, valueOne: '89',
      'ts': '2014-10-10 03:32:09.350'
    };
    utils.assertLogModelErrors(log).should.containEql(validationMsg.ACTIONID_NOT_IN_RANGE);
  });

  it('Validate Log - Should be able to set Persona id to NA if not passed', function() {
    var  log = {
      vaultId: 'aaa..bbb', sessionId: 'gjhjhjhfg80987676', actionId: 12, valueOne: '89',
      'ts': '2014-16-10 03:32:09.350'
    };
    utils.assertLogModelErrors(log).should.be.ok;
  });

  it('Validate Log - Should be able to transform from old version of log to new version ', function() {
    var  log = {
      'vault_id': 'aaa..bbb', 'session_id': 'gjhjhjhfg80987676', 'action_id': 12, 'persona_id': 10, value1: '89',
      'ts': '2014-16-10 03:32:09.350'
    };
    utils.assertLogModelErrors(log).should.be.ok;
  });

  it('Validate Log - Should throw an error if Invalid Date format is passed', function() {
    var  log = {
      vaultId: 'aaa..bbb', sessionId: 'gjhjhjhfg80987676', actionId: 13, personaId: 10, valueOne: '89',
      'ts': '2014-16-10 03:32:09.350'
    };
    utils.assertLogModelErrors(log).should.containEql(validationMsg.INVALID_DATE_FORMAT);
  });

  it('Validate Log - Should throw an error if any required field is missing', function() {
    var   log = {
      vaultId: 'aaa..bbb', sessionId: 'gjhjhjhfg80987676', personaId: 10, valueOne: '89',
      'ts': '2014-16-10 03:32:09.350'
    };
    utils.assertLogModelErrors(log).should.be.ok;
  });

  it('Validate Log - Should throw an error if Persona ID is not a valid integer', function() {
    var log = {
      vaultId: 'aaa..bbb', sessionId: 'gjhjhjhfg80987676', actionId: 10, personaId: 'str', valueOne: '89',
      'ts': '2014-10-10 03:32:09.350'
    };
    utils.assertLogModelErrors(log).should.containEql(validationMsg.PERSONA_ID_NOT_A_NUMBER);
  });

  it('Validate Log - should throw error if vaultId parameter is not present', function() {
    var log = {
      vaultId: '', sessionId: 'gjhjhjhfg80987676', actionId: 17, personaId: 10, valueOne: '89',
      'ts': '2014-10-10 03:32:09.350'
    };
    should(utils.assertLogModelErrors(log)).be.ok;
    log = {
      vaultId: null, sessionId: 'gjhjhjhfg80987676', actionId: 17, personaId: 10, valueOne: '89',
      'ts': '2014-10-10 03:32:09.350'
    };
    should(utils.assertLogModelErrors(log)).be.ok;
    log = {
      sessionId: 'gjhjhjhfg80987676', actionId: 17, personaId: 10, valueOne: '89',
      'ts': '2014-10-10 03:32:09.350'
    };
    should(utils.assertLogModelErrors(log)).be.ok;
    log = {
      vaultId: 'sdsd', sessionId: 'gjhjhjhfg80987676', actionId: 17, personaId: 10, valueOne: '89',
      'ts': '2014-10-10 03:32:09.350'
    };
    should(utils.assertLogModelErrors(log)).not.be.ok;
  });
  it('Validate Log - should throw error if sessionId parameter is not present', function() {
    var log = {
      vaultId: 'sds', sessionId: '', actionId: 17, personaId: 10, valueOne: '89',
      'ts': '2014-10-10 03:32:09.350'
    };
    should(utils.assertLogModelErrors(log)).be.ok;
    log = {
      vaultId: null, sessionId: null, actionId: 17, personaId: 10, valueOne: '89', 'ts': '2014-10-10 03:32:09.350'
    };
    should(utils.assertLogModelErrors(log)).be.ok;
    log = {
      vaultId: 'gjhjhjhfg80987676', actionId: 17, personaId: 10, valueOne: '89',  'ts': '2014-10-10 03:32:09.350'
    };
    should(utils.assertLogModelErrors(log)).be.ok;
    log = {
      vaultId: 'sdsd', sessionId: 'gjhjhjhfg80987676', actionId: 17, personaId: 10, valueOne: '89',
      'ts': '2014-10-10 03:32:09.350'
    };
    should(utils.assertLogModelErrors(log)).not.be.ok;
  });
  it('Validate Log - should validate for all mandatory values', function() {
    var log = {
      vaultId: 'sdsd', sessionId: 'gjhjhjhfg80987676', actionId: 8, personaId: 10, valueOne: '89',
      'ts': '2014-10-10 03:32:09.350'
    };
    should(utils.assertLogModelErrors(log)).be.ok;
  });
  it('Validate Log - should throw error if timestamp is missing', function() {
    var log = {
      vaultId: 'sdsd', sessionId: 'gjhjhjhfg80987676', actionId: 3, personaId: 10, valueOne: '89'
    };
    should(utils.assertLogModelErrors(log)).be.ok;
  });
});
