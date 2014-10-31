/* global window:false */
window.Transform = [ function() {
  var instance = this;
  var formatVaultId = function(vaultId) {
    return vaultId.slice(0, 6) + '..' + vaultId.slice(vaultId.length - 6, vaultId.length);
  };
  var getExpected = function(vaultId, expected) {
    for (var index in expected) {
      if (expected[index] && formatVaultId(expected[index].vaultId) === vaultId) {
        return expected[index].closestVaults;
      }
    }
  };
  var transform = function(actual, expected) {
    var result = [];
    for (var index in actual) {
      if (actual[index]) {
        var temp = {};
        temp.name = actual[index].vaultId;
        temp.group = actual[index].valueOne.closeGroup;
        temp.lastIn = actual[index].valueOne.vaultAdded;
        temp.lastOut = actual[index].valueOne.vaultRemoved;
        temp.expected = getExpected(actual[index].vaultId, expected);
        result.push(temp);
      }
    }
    return result;
  };
  instance.transform = transform;
} ];
