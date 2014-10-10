/* global window:false */

window.VaultBehaviourService = [
  function() {
    var service = this;
    service.MAX_LOGS = 3; // Max logs retained for showing on info click
    service.personas = {
      0: 'MAID',
      1: 'MPID',
      2: 'Data-Getter',
      3: 'MAID-Manager',
      4: 'Data-Manager',
      5: 'PMID-Manager',
      6: 'PMID',
      7: 'MPID-Manager',
      8: 'Version-Handler',
      9: 'Cache-Handler',
      10: 'NA'
    };
    service.actions = {
      0: 'Vault Started',
      1: 'Increase count to',
      2: 'Decrease count to',
      3: 'Blocked Delete Request',
      4: 'Account Transfer',
      5: 'Got Account Transferred',
      6: 'Increase Subscribers to',
      7: 'Decrease Subscribers to',
      8: 'Move Chunk',
      9: 'Marking Node up',
      10: 'Marking Node Down',
      11: 'Joining PMID Node',
      12: 'Dropping PMID Node',
      13: 'Storing Chunk',
      14: 'Deleting Chunk',
      15: 'Update Version',
      16: 'Remove Account',
      17: 'Network Health Changed',
      18: 'Vault Stopping'
    };
    service.icons = {
      0: { account: 'hexagon', chunk: 'circle', subscriber: 'square', counter: 'rhombus' },
      1: { account: 'hexagon', chunk: 'circle', subscriber: 'square', counter: 'rhombus-green' },
      2: { account: 'hexagon', chunk: 'circle', subscriber: 'square', counter: 'rhombus-red' },
      3: { account: 'hexagon', chunk: 'blocked-delete-request', subscriber: 'square', counter: 'rhombus' },
      4: { account: 'transfer-account', chunk: 'circle', subscriber: 'square', counter: 'rhombus' },
      5: { account: 'account-transferred', chunk: 'circle', subscriber: 'square', counter: 'rhombus' },
      6: { account: 'hexagon', chunk: 'circle', subscriber: 'square-green', counter: 'rhombus' },
      7: { account: 'hexagon', chunk: 'circle', subscriber: 'square-red', counter: 'rhombus' },
      8: { account: 'hexagon', chunk: 'move-data', subscriber: 'square', counter: 'rhombus' },
      9: { account: 'marking-node-up', chunk: 'circle', subscriber: 'square', counter: 'rhombus' },
      10: { account: 'marking-node-down', chunk: 'circle', subscriber: 'square', counter: 'rhombus' },
      11: { account: 'joining-pmid-node', chunk: 'circle', subscriber: 'square', counter: 'rhombus' },
      12: { account: 'dropping-pmid-node', chunk: 'circle', subscriber: 'square', counter: 'rhombus' },
      13: { account: 'hexagon', chunk: 'storing-data', subscriber: 'square', counter: 'rhombus' },
      14: { account: 'hexagon', chunk: 'deleting-data', subscriber: 'square', counter: 'rhombus' },
      15: { account: 'hexagon', chunk: 'update-data-version', subscriber: 'square', counter: 'rhombus' },
      16: { account: 'remove-account', chunk: 'circle', subscriber: 'square', counter: 'rhombus' },
      17: { account: 'hexagon', chunk: 'circle', subscriber: 'square', counter: 'rhombus' },
      18: { account: 'hexagon', chunk: 'circle', subscriber: 'square', counter: 'rhombus' }
    };
    service.iconShapes = {
      HEXAGON: 0,
      CIRCLE: 1,
      SQUARE: 2,
      DIAMOND: 3
    };
    var generalFormat = function(log) {
      return service.personas[log.personaId] + ' - ' + service.actions[log.actionId] + ' ';
    };
    var trim = function(txt) {
      if (txt && txt.length > 10) {
        return txt.substring(0, 6) + '..' + txt.substr(txt.length - 6);
      }
      return txt;
    };
    var formatWithOneValue = function(log, includePersona) {
      var result = includePersona ? service.personas[log.personaId] + ' - ' : '';
      return result + service.actions[log.actionId] + ' ' + trim(log.value1);
    };
    var formatWithTwoValues = function(log, includePersona) {
      var result = includePersona ? service.personas[log.personaId] + ' - ' : '';
      return result + service.actions[log.actionId] + ' ' + trim(log.value1) + ' : ' + trim(log.value2);
    };
    var formats = {
      1: formatWithOneValue,
      2: formatWithOneValue,
      3: formatWithOneValue,
      4: formatWithTwoValues,
      5: formatWithTwoValues,
      6: formatWithOneValue,
      7: formatWithOneValue,
      8: formatWithTwoValues,
      9: formatWithOneValue,
      10: formatWithOneValue,
      11: formatWithOneValue,
      12: formatWithOneValue,
      13: formatWithOneValue,
      14: formatWithOneValue,
      15: formatWithTwoValues,
      16: formatWithOneValue,
      17: formatWithOneValue,
      18: formatWithOneValue
    };
    service.formatMessage = function(log, includePersona) {
      return (formats[log.actionId] || generalFormat)(log, includePersona);
    };
    service.alertMessage = function(log) {
      if (log.actionId === 0 || log.actionId === 17 || log.actionId === 18) {
        return null;
      }
      return service.formatMessage(log, false);
    };
  }
];
