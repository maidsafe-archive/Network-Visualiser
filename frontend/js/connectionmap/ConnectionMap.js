/*
 * TODO :: Set width and height dynamically based on parent node, present logic wont hold good
 */
/* global window:false */
/* global d3:false */
/* global ConnectionMapTransformer:false */
/* global ConnectionEvents:false */
/*jshint unused:false*/
var ConnectionMapBuilder = function(connectionMap, elementId) {
  var instance = this;
  var div = d3.select('#' + elementId);
  // Constants
  // ---------
  var svg;
  var WIDTH = window.innerWidth;// - (window.innerWidth / 100);// 20 is picked random
  var HEIGHT = window.innerHeight - 200; // 90 (header) + 50 (footer) + 50 (bottom status) + 10 padding
  var RADIUS_X = WIDTH / 2;
  var RADIUS_Y = HEIGHT / 2;
  var CIRCLE_TEXT_GAP = 18;
  var CIRCLE_LINE_GAP = 3;
  var CIRCLE_FULL_LIMIT = 16; // when the circle will be full blue
  var CIRCLE_SIZE = 3;
  var INITIAL_SCALE_LEVEL = 0; // TODO Dynamically update based on the number of vaults
  // Helpers
  // -------
  var lastDragPosition;
  var transX = RADIUS_X;
  var transY = RADIUS_Y;
  var lastScale = INITIAL_SCALE_LEVEL;
  var connectionMapEvents = new ConnectionEvents();
  var events = {
    nodeClicked: null
  };
  var setLastScale = function(scale) {
    lastScale = scale;
  };
  connectionMapEvents.onNodeTextClicked(function(selected, node) {
    if (events.nodeClicked) {
      events.nodeClicked(selected, node);
    }
  });
  var replaceVaultFormat = function(data) {
    return data.indexOf('..') !== -1 ? data.replace('..', '_') : data.replace('_', '..');
  };
  var zoom = function() {
    if (lastDragPosition) {
      transX += (-1 * (lastDragPosition.sourceEvent.offsetX - d3.event.sourceEvent.offsetX));
      transY += (-1 * (lastDragPosition.sourceEvent.offsetY - d3.event.sourceEvent.offsetY));
    }
    lastScale =  d3.event.scale;
    svg.attr('transform', 'translate(' + [ transX, transY ] + ')scale(' + lastScale + ')');
  };
  var dragEvent = d3.behavior.drag()
    .on('dragstart', function() {
      lastDragPosition = d3.event;
    }).on('drag', function() {
      lastDragPosition = d3.event;
    })
    .on('dragend', function() {
      lastDragPosition = null;
    });
  var bundle = d3.layout.bundle();
  var line = d3.svg.line.radial().
    interpolate('bundle').
    tension(0.85).
    radius(function(d) {
      return d.y;
    }).
    angle(function(d) {
      return d.x / 180 * Math.PI;
    });
  svg = div.append('svg:svg').
    attr('preserveAspectRatio', 'xMinYMin meet').
    attr('viewBox', [ 0, 0, WIDTH, HEIGHT ].join(' ')).
    attr('height', HEIGHT);
  var drawConnectionLinks = function(connections) {
    var lastNodeSelection = null;
    if (connectionMapEvents.isAnyNodeClicked()) {
      lastNodeSelection = d3.select('svg text.selected');
      if (!lastNodeSelection || !lastNodeSelection[0][0]) {
        connectionMapEvents.clearNodeClickedState();
        connectionMapEvents.mouseout();
      }
    }
    d3.select('svg g').remove('*');
    svg = d3.select('svg').append('svg:g').
      call(d3.behavior.zoom().scaleExtent([ -5, 20 ]).on('zoom', zoom)).call(dragEvent).
      attr('transform', function() {
        if (lastScale) {
          return 'translate(' + transX + ',' + transY + ')scale(' + lastScale + ')';
        }
        return 'translate(' + transX + ',' + transY + ')';
      });
    svg.on('dblclick.zoom', null);
    connectionMap = connections || connectionMap;
    var cluster = d3.layout.cluster().
      size([ 360, RADIUS_Y / 2 ])
      .sort(function(a, b) {
        return d3.ascending(a.name, b.name);
      });
    var transformedData = new ConnectionMapTransformer(connectionMap);
    connectionMapEvents.updateSVG(svg);
    connectionMap.sort(function(a, b) {
      return a.name < b.name;
    });
    svg.selectAll('*').remove();
    svg.append('svg:path')
      .attr('class', 'arc')
      .attr('d', d3.svg.arc().outerRadius(RADIUS_Y - (RADIUS_Y / 0.33)).innerRadius(0)
      .startAngle(0).endAngle(2 * Math.PI))
      .on('dblclick', connectionMapEvents.mousedown);
    var nodes = cluster.nodes(transformedData.nodes);
    var splines = bundle(transformedData.links);
    var path = svg.selectAll('path.link')
      .data(transformedData.links)
      .enter().append('svg:path')
      .attr('class', function(d) {
        return 'link source-' + replaceVaultFormat(d.source.name) + ' target-' + replaceVaultFormat(d.target.name);
      })
      .attr('d', function(d, i) {
        return line(splines[i]);
      });
    nodes = svg.selectAll('g.node')
      .data(nodes.filter(function(n) {
        return !n.children;
      }))
      .enter().append('svg:g')
      .attr('class', 'node')
      .attr('id', function(d) {
        return 'node-' + replaceVaultFormat(d.name);
      })
      .attr('transform', function(d) {
        return 'rotate(' + (d.x - 90) + ')translate(' + d.y + ')';
      });
    nodes.append('svg:text')
      .attr('dx', function(d) {
        return d.x < 180 ? CIRCLE_TEXT_GAP : -CIRCLE_TEXT_GAP;
      })
      .attr('dy', '.31em')
      .attr('text-anchor', function(d) {
        return d.x < 180 ? 'start' : 'end';
      })
      .attr('transform', function(d) {
        return d.x < 180 ? null : 'rotate(180)';
      })
      .text(function(d) {
        return d.name;
      })
      .attr('text', function(d) {
        return d.name;
      })
      .on('mouseover', connectionMapEvents.mouseover)
      .on('mouseout', connectionMapEvents.mouseout)
      .on('click', connectionMapEvents.mouseClick);
    nodes.append('svg:circle')
      .attr('cx', CIRCLE_SIZE)
      .attr('cy', CIRCLE_SIZE)
      .attr('r', CIRCLE_SIZE)
      .attr('transform', 'translate(' + CIRCLE_LINE_GAP + ',-' + CIRCLE_LINE_GAP + ')')
      .classed('full', function(d) {
        return d.group && d.group.length === CIRCLE_FULL_LIMIT;
      });
    connectionMapEvents.updateLinksOnLoad(nodes);
    if (lastNodeSelection && lastNodeSelection[0][0]) {
      var node = d3.select('svg text[text="' + lastNodeSelection.text() + '"]');
      if (!node || !node[0]) {
        return;
      }
      node.on('click')(node.data()[0]);
    }
  };
  instance.onNodeTextClicked = function(callback) {
    events.nodeClicked = callback;
  };
  instance.setConnectionMode = function(mode) {
    connectionMapEvents.setMode(mode);
  };
  instance.drawConnections = drawConnectionLinks;
  instance.setLastScale = setLastScale;
  return instance;
};
