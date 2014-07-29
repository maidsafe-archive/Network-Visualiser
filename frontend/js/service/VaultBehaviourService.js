var VaultBehaviourService = [
  function() {
    var service = this;

    service.MAX_LOGS = 3; //Max logs retained for showing on info click

    service.personas = {
      0: 'MaidNode',
      1: 'MpidNode',
      2: 'DataGetter',
      3: 'MaidManager',
      4: 'DataManager',
      5: 'PmidManager',
      6: 'PmidNode',
      7: 'MpidManager',
      8: 'VersionHandler',
      9: 'Cachehandler',
      10: 'NA'
    };
    service.actions = {
      0: 'Vault Started',
      1: 'Increases count to',
      2: 'Decreases count to',
      3: 'Blocked Delete Request',
      4: 'Account Transfer',
      5: 'Got Account Transferred',
      6: 'Increase Subscribers',
      7: 'Decrease Subscribers',
      8: 'Move Chunk',
      9: 'Marking Node up',
      10: 'Marking Node Down',
      11: 'Joining PMID Node',
      12: 'Dropping PMID Node',
      13: 'Storing Chunk',
      14: 'Deleting Chunk',
      15: 'Update Version',
      16: 'Remove Account',
      17: 'Network Health changed',
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
    var tootips = {
      0: [4, 5, 9, 10, 11, 12, 16],
      1: [3, 8, 13, 14, 15],
      2: [6, 7],
      3: [1, 2,]
    };
    var generalFormat = function(log) {
      return service.personas[log.persona_id] + ' - ' + service.actions[log.action_id] + ' ';
    };
    var trim = function(txt) {
      if (txt && txt.length > 10) {
        return txt.substring(0, 6) + '..' + txt.substr(txt.length - 6);
      }
      return txt;
    };
    var formatWithOneValue = function(log) {
      return service.personas[log.persona_id] + ' - ' + service.actions[log.action_id] + ' ' + trim(log.value1);
    };
    var formatWithTwoValues = function(log) {
      return service.personas[log.persona_id] + ' - ' + service.actions[log.action_id] + ' ' + trim(log.value1) + " : " + trim(log.value2);
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
    service.formatMessage = function(log) {
      return (formats[log.action_id] || generalFormat)(log);
    };
    service.canShowToolTip = function(shape, actionId) {
      return tootips[shape].indexOf(parseInt(actionId)) > -1;
    };
  }
]