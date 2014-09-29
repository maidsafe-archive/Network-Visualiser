function ConnectionMapTransformer(connectionMap) {
  var generateNodes = function () {
    var map = {};
    var addConnections = function (vault, key, max) {
      for (var i = 0; i < max; i++) {
        if (vault[key][i]) {
          if (vault.connections.indexOf(vault[key][i]) < 0) {
            vault.connections.push(vault[key][i]);
          }
        }
      }
    };
    var updateConnections = function (vault) {
      vault.connections = []
      if (vault.expected && vault.expected.length > 0) {
        addConnections(vault, 'expected', 4);
      }
      if (vault.group && vault.group.length > 0) {
        addConnections(vault, 'group', 16);
      }
      if (vault.lastIn) {
        vault.connections.push(vault.lastIn);
      }
      if (vault.lastOut) {
        vault.connections.push(vault.lastOut);
      }
    };
    var standarizeData = function () {
      connectionMap.forEach(function (vault) {
        updateConnections(vault);
        vault.connections.forEach(function (name) {
          if (!map[name]) {
            ;
            map[name] = true;
            connectionMap.push({
              name: name,
              connections: []
            });
          }
        });
      });
      map = {};
    };
    var find = function (name, data) {
      var node = map[name];
      if (!node) {
        node = map[name] = data || {name: name, children: []};
        if (name.length) {
          node.parent = find('');
          node.parent.children.push(node);
        }
      }
      return node;
    };
    standarizeData();
    connectionMap.forEach(function (d) {
      find(d.name, d);
    });
    console.log(map);
    return map[''];
  };
  var generateLinks = function (nodes) {
    var map = {};
    var temp;
    var connectionLinks = [];
    nodes.children.forEach(function (d) {
      map[d.name] = d;
    });
    nodes.children.forEach(function (d) {
      if (d.connections) {
        d.connections.forEach(function (i) {
          temp = {source: map[d.name], target: map[i], isDashed: false};
          if (map[d.name].expected.indexOf(i) > -1) {
            temp.isDashed = true;
          }
          connectionLinks.push(temp);
        });
      }
    });
    return connectionLinks;
  };
  var reset = function (svg) {
    svg.selectAll("path.link.overlaped-target").classed('overlaped-target', false);
    svg.selectAll("path.link.group").classed('group', false);
  };
  this.nodes = generateNodes();
  this.links = generateLinks(this.nodes);
  this.updateConnectionLinks = function (svg, node) {
    reset(svg);
    if (node.group) {
      node.group.forEach(function (d) {
        svg.selectAll("path.link.source-" + node.name + ".target-" + d).classed('group', true)
      });
      svg.selectAll("path.link.target-" + node.name).classed('overlaped-target', true);
    }
  };
  return this;
};
