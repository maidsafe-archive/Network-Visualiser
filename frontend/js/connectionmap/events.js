/* global d3:false */
/*jshint unused:false*/
/* global window:false */
var ConnectionEvents = function(svg) {
  var instance = this;
  var css = {
    GROUP_CLASS: 'group',
    OVERLAPPING_TARGET_CLASS: 'overlaped-target',
    CLOSE_GROUP_CLASS: 'close-group',
    HIDE_PATH: 'hidePath',
    MISSING_EXPECTED: 'missing-expected',
    NOT_EXPECTED_CLASS: 'not-expected',
    VAULT_ENTERED_CLASS: 'in',
    VAULT_LEFT_CLASS: 'out',
    GREY_LINK_CLASS: 'grey',
    TEXT_NODE_SELECTED_CLASS: 'selected'
  };
  var CLOSE_GROUP_LIMIT = 4;
  var LINK_MODE = { CONNECTIVITY: 1, CHURN: 2 };
  var connectionMode = LINK_MODE.CONNECTIVITY;
  var clickEvent = { state: false, node: null };
  var nodeTextClicked = null;
  var replaceVaultFormat = function(data) {
    if (data.indexOf('..') !== -1) {
      return data.replace('..', '_');
    }
    if (data.indexOf('_') !== -1) {
      return data.replace('_', '..');
    }
  };
  var togglePathVisibilityForConnections = function(node, show) {
    if (node.group && node.group.length > CLOSE_GROUP_LIMIT) {
      var connections =  node.group.slice(CLOSE_GROUP_LIMIT);
      connections.forEach(function(vaultName) {
        svg.selectAll('path.link.source-' + replaceVaultFormat(node.name) + '.target-' +
        replaceVaultFormat(vaultName))
          .classed(css.HIDE_PATH, show);
      });
    }
  };
  var updateExpectedAndMissingLinks = function(node) {
    if (node.group && node.expected) {
      var actual = node.group.slice(0, CLOSE_GROUP_LIMIT);
      node.expected.forEach(function(expected) {
        if (actual.indexOf(expected) === -1) {
          svg.select('g#node-' + replaceVaultFormat(expected) + ' text').classed('blue', false).classed('red', true);
          svg.selectAll('path.link.source-' + replaceVaultFormat(node.name) + '.target-' + replaceVaultFormat(expected))
            .classed(css.CLOSE_GROUP_CLASS, false).classed(css.MISSING_EXPECTED, true);
        }
      });
      actual.forEach(function(vaultName) {
        if (node.expected.indexOf(vaultName) === -1) {
          svg.select('g#node-' + replaceVaultFormat(vaultName) + ' text').classed('blue', false).classed('orange', true
          );
          svg.selectAll('path.link.source-' + replaceVaultFormat(node.name) + '.target-' +
            replaceVaultFormat(vaultName))
            .classed(css.GROUP_CLASS, false).classed(css.CLOSE_GROUP_CLASS, false).classed(css.MISSING_EXPECTED, false)
            .classed(css.NOT_EXPECTED_CLASS, true);
        }
      });
    }
  };
  var updateConnectionLinks = function(svg, node) {
    revertConnections(svg);
    svg.select('svg g#node-' + replaceVaultFormat(node.name) + ' text').classed(css.TEXT_NODE_SELECTED_CLASS, true);
    svg.selectAll('.link').classed(css.GREY_LINK_CLASS, true);
    if (node.group) {
      if (connectionMode === LINK_MODE.CONNECTIVITY) {
        node.group.slice(0, CLOSE_GROUP_LIMIT).forEach(function(vaultName) {
          svg.select('g#node-' + replaceVaultFormat(vaultName) + ' text').classed('blue', true);
          svg.selectAll('path.link.source-' + replaceVaultFormat(node.name) + '.target-' +
            replaceVaultFormat(vaultName))
            .classed(css.CLOSE_GROUP_CLASS, true);
        });
      }
      if (connectionMode === LINK_MODE.CHURN) {
        var className;
        var labelClass;
        if (node.lastIn) {
          className = css.VAULT_ENTERED_CLASS;
          labelClass = 'green';
          svg.select('g#node-' + replaceVaultFormat(node.lastIn) + ' text').classed(labelClass, true);
          svg.selectAll('path.link.source-' + replaceVaultFormat(node.name) + '.target-' +
          replaceVaultFormat(node.lastIn)).classed(className, true);
        }
        if (node.lastOut) {
          className = css.VAULT_LEFT_CLASS;
          labelClass = 'red';
          svg.select('g#node-' + replaceVaultFormat(node.lastOut) + ' text').classed(labelClass, true);
          svg.selectAll('path.link.source-' + replaceVaultFormat(node.name) + '.target-' +
          replaceVaultFormat(node.lastOut)).classed(className, true);
        }
        node.group.forEach(function(d) {
          className = css.GROUP_CLASS;
          labelClass = 'light-blue';
          svg.select('g#node-' + replaceVaultFormat(d) + ' text').classed(labelClass, true);
          svg.selectAll('path.link.source-' + replaceVaultFormat(node.name) + '.target-' +
            replaceVaultFormat(d)).classed(className, true).classed(css.HIDE_PATH, false);
        });
      }
      svg.selectAll('path.link.target-' + replaceVaultFormat(node.name)).classed(css.OVERLAPPING_TARGET_CLASS, true);
    }
    if (node.expected && connectionMode === LINK_MODE.CONNECTIVITY) {
      updateExpectedAndMissingLinks(node);
    }
  };
  var revertConnections = function(node) {
    node = node || clickEvent.node;
    if (clickEvent.state || !node || !node.name) {
      return;
    }
    var linkClasses = [ css.OVERLAPPING_TARGET_CLASS, css.GROUP_CLASS, css.GREY_LINK_CLASS,
      css.VAULT_ENTERED_CLASS, css.VAULT_LEFT_CLASS, css.MISSING_EXPECTED, css.NOT_EXPECTED_CLASS,
      css.CLOSE_GROUP_CLASS
    ];
    var textClasses = [ 'blue', 'green', 'red', 'orange', 'light-blue' ];
    linkClasses.forEach(function(className) {
      svg.selectAll('path.link.' + className).classed(className, false);
    });
    togglePathVisibilityForConnections(node, true);
    textClasses.forEach(function(className) {
      svg.selectAll('g.node text').classed(className, false);
    });
    svg.selectAll('path.link.source-' + replaceVaultFormat(node.name))
      .classed('source', false).each(updateNodes('target', false));
    svg.selectAll('path.link.target-' + replaceVaultFormat(node.name))
      .classed('target', false).each(updateNodes('source', false));
    svg.select('g text.selected').classed(css.TEXT_NODE_SELECTED_CLASS, false);
  };
  var showConnections = function(d) {
    svg.selectAll('path.link.target-' + replaceVaultFormat(d.name))
      .classed('target', true).each(updateNodes('source', true));
    svg.selectAll('path.link.source-' + replaceVaultFormat(d.name))
      .classed('source', true).each(updateNodes('target', true));
    updateConnectionLinks(svg, d);
  };
  var updateNodes = function(name, value) {
    return function(d) {
      if (value) {
        this.parentNode.appendChild(this);
      }
      svg.select('#node-' + replaceVaultFormat(d[name].name)).classed(name, value);
    };
  };
  var mouseDown = function() {
    if (!clickEvent.state) {
      return;
    }
    clickEvent.state = false;
    revertConnections(clickEvent.node);
    if (nodeTextClicked) {
      connectionMode = LINK_MODE.CONNECTIVITY;
      nodeTextClicked(false, clickEvent.node);
    }
  };
  var restoreMouseClick = function() {
    if (clickEvent.state) {
      clickEvent.state = false;
      revertConnections(clickEvent.node);
      clickEvent.state = true;
      showConnections(clickEvent.node);
    }
  };
  var mouseClick = function(d) {
    if (clickEvent.state) {
      clickEvent.state = false;
      revertConnections(clickEvent.node);
    }
    clickEvent.state = true;
    clickEvent.node = d;
    showConnections(d);
    if (nodeTextClicked) {
      nodeTextClicked(true, d);
    }
  };
  var updateLinksOnLoad = function(nodes) {
    nodes.each(function(node) {
      togglePathVisibilityForConnections(node, true);
      if (node.group && node.expected) {
        var actual = node.group.slice(0, CLOSE_GROUP_LIMIT);
        node.expected.forEach(function(expected) {
          if (actual.indexOf(expected) === -1) {
            svg.selectAll('path.link.source-' + replaceVaultFormat(node.name) + '.target-' +
              replaceVaultFormat(expected))
              .classed('missing', true);
          }
        });
        actual.forEach(function(vaultName) {
          if (node.expected.indexOf(vaultName) === -1) {
            svg.selectAll('path.link.source-' + replaceVaultFormat(node.name) + '.target-' +
              replaceVaultFormat(vaultName)).classed('missing', false).classed('not-exp', true);
          }
        });
      }
    });
    if (clickEvent.state) {
      d3.selectAll('.link').classed('grey', true);
    }
  };
  var mouseOver = function(d) {
    if (!clickEvent.state) {
      showConnections(d);
    }
  };
  var setMode = function(modeSelected) {
    connectionMode = modeSelected;
    if (!clickEvent.node) {
      return;
    }
    if (clickEvent.state) {
      clickEvent.state = false;
      revertConnections(clickEvent.node);
      clickEvent.state = true;
      showConnections(clickEvent.node);
    }
  };
  var updateSVG = function(svgRegion) {
    svg = svgRegion;
    setTimeout(restoreMouseClick, 1);
  };
  var onNodeTextClicked = function(callback) {
    nodeTextClicked = callback;
  };
  instance.isAnyNodeClicked = function() {
    return clickEvent.state;
  };
  instance.clearNodeClickedState = function() {
    clickEvent.state = false;
  };
  instance.mousedown = mouseDown;
  instance.mouseClick = mouseClick;
  instance.updateLinksOnLoad = updateLinksOnLoad;
  instance.mouseover = mouseOver;
  instance.setMode = setMode;
  instance.mouseout = revertConnections;
  instance.updateSVG = updateSVG;
  instance.onNodeTextClicked = onNodeTextClicked;
  return instance;
};
