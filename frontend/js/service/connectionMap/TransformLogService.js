/* global window:false */

window.Transform = [ function() {
  var instance = this;
  var formatVaultId = function(vaultId) {
    return vaultId.slice(0, 6) + '..' + vaultId.slice(vaultId.length - 6, vaultId.length);
  };
  var getExpected = function(vaultId, expected) {
    if (expected[vaultId]) {
      return expected[vaultId] || [];
    }
    return [];
  };
  var transform = function(actual, expected) {
    var result = [];
    for (var index in actual) {
      if (actual[index]) {
        result.push({
          'name': formatVaultId(actual[index].vaultId),
          'group': actual[index].valueOne.closeGroupVaults || [],
          'lastIn': actual[index].valueOne.vaultAdded || '',
          'lastOut': actual[index].valueOne.vaultRemoved || '',
          'expected': getExpected(actual[index].vaultId, expected)
        });
      }
    }
    return result;
  };
  instance.formatVaultId = formatVaultId;
  instance.transform = transform;
} ];
