/* global window:false */
window.partialSort = [ function() {
  var hexDecode = function(hex) {
    var rawId = [];
    for (var i = 0; i < hex.length; i += 2) {
      rawId.push(parseInt(hex.substr(i, 2), 16));
    }
    return rawId;
  };
  var closerToTarget = function(nodeA, nodeB, target) {
    // return -1 if a closer than b
    // return 1 if b closer than a
    // 0 if equal
    var nodeAId = hexDecode(nodeA);
    var nodeBId = hexDecode(nodeB);
    var targetId = hexDecode(target);
    for (var i = 0; i < 64; ++i) {
      var result1 = nodeAId[i] ^ targetId[i];
      var result2 = nodeBId[i] ^ targetId[i];
      if (result1 !== result2) {
        return result1 < result2 ? -1 : 1;
      }
    }
    return 0;
  };
  var bisect = function(items, x, target) {
    var mid;
    var lo = 0;
    var hi = items.length;
    while (lo < hi) {
      mid = Math.floor((lo + hi) / 2);
      if (closerToTarget(x, items[mid], target) < 0) {
        hi = mid;
      } else {
        lo = mid + 1;
      }
    }
    return lo;
  };
  var insort = function(closest, x, target) {
    var insertAt = bisect(closest, x, target);
    var clone = closest.splice(0);
    closest = clone.slice(0, insertAt);
    closest.push(x);
    closest = closest.concat(clone.slice(insertAt, clone.length));
    closest.pop();
    return closest;
  };
  var sort = function(vaults, maxSize, target) {
    var closest;
    var max;
    closest = vaults.slice(0, maxSize).sort(function(i, j) {
      return closerToTarget(i, j, target);
    });
    max = closest[maxSize - 1];
    for (var i = maxSize; i < vaults.length; i++) {
      if (closerToTarget(max, vaults[i], target) > 0) {
        closest = insort(closest, vaults[i], target);
        max = closest[maxSize - 1];
      }
    }
    return closest;
  };
  this.sort = sort;
  this.closerToTarget = closerToTarget;
} ];
