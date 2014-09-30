/*
 * TODO :: Set width and height dynamically based on parent node, present logic wont hold good
 */
function ConnectionMapBuilder(connectionMap, elementId) {
  var div = d3.select('#' + elementId);
  // Constants
  // ---------
  var svg;
  var PADDING_WIDTH = 20;
  var WIDTH = window.innerWidth - (window.innerWidth / PADDING_WIDTH );
  var HEIGHT = window.innerHeight - 155 , // 90 (header) + 50 (footer) + 15 (padding)
    RADIUS_X = WIDTH / 2,
    RADIUS_Y = HEIGHT / 2,
    CIRCLE_TEXT_GAP = 18,
    CIRCLE_LINE_GAP = 3,
    CIRCLE_FULL_LIMIT = 5,
    CIRCLE_SIZE = 3;
  // Helpers
  // -------
  var lastDragPosition, transX = RADIUS_X, transY = RADIUS_Y;

  function zoom() {
    if (lastDragPosition) {
      transX += (-1 * ( lastDragPosition.sourceEvent.offsetX - d3.event.sourceEvent.offsetX ));
      transY += (-1 * ( lastDragPosition.sourceEvent.offsetY - d3.event.sourceEvent.offsetY ));
    }
    svg.attr("transform", "translate(" + [transX, transY] + ")scale(" + d3.event.scale + ")");
  };

  var dragEvent = d3.behavior.drag()
    .on('dragstart', function () {
      lastDragPosition = d3.event;
    }).on('drag', function () {
      lastDragPosition = d3.event;
    })
    .on("dragend", function () {
      lastDragPosition = null;
    });
  var bundle = d3.layout.bundle();
  var line = d3.svg.line.radial().
    interpolate("bundle").
    tension(.85).
    radius(function (d) {
      return d.y;
    }).
    angle(function (d) {
      return d.x / 180 * Math.PI;
    });
  var drawConnectionLinks = function (connections) {
    d3.select('svg').remove('*');
    connectionMap = connections || connectionMap;
    svg = div.append("svg:svg").
      attr("preserveAspectRatio", "xMinYMin meet").
      attr("viewBox", [0, 0, WIDTH, HEIGHT].join(' ')).
      attr("height", HEIGHT).
      append("svg:g").
      call(d3.behavior.zoom().scaleExtent([-5, 20]).on("zoom", zoom)).call(dragEvent).
      attr("transform", "translate(" + RADIUS_X + "," + RADIUS_Y + ")");
    var cluster = d3.layout.cluster().
      size([360, RADIUS_Y / 2])
      .sort(function (a, b) {
        return d3.ascending(a.name, b.name);
      });
    console.log('ininin')
    var transformedData = new ConnectionMapTransformer(connectionMap);
    window.events = new ConnectionEvents(svg);
    connectionMap.sort(function (a, b) {
      return  a.name < b.name;
    });
    svg.selectAll('*').remove();
    svg.append("svg:path")
      .attr("class", "arc")
      .attr("d", d3.svg.arc().outerRadius(RADIUS_Y - (RADIUS_Y / .33)).innerRadius(0).startAngle(0).endAngle(2 * Math.PI))
      .on("mousedown", events.mousedown);
    var nodes = cluster.nodes(transformedData.nodes);
    var splines = bundle(transformedData.links)
    var path = svg.selectAll("path.link")
      .data(transformedData.links)
      .enter().append("svg:path")
      .attr("class", function (d) {
        return "link source-" + d.source.name + " target-" + d.target.name;
      })
      .attr("d", function (d, i) {
        return line(splines[i]);
      });
    var nodes = svg.selectAll("g.node")
      .data(nodes.filter(function (n) {
        return !n.children;
      }))
      .enter().append("svg:g")
      .attr("class", "node")
      .attr("id", function (d) {
        return "node-" + d.name;
      })
      .attr("transform", function (d) {
        return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")";
      });
    nodes.append("svg:text")
      .attr("dx", function (d) {
        return d.x < 180 ? CIRCLE_TEXT_GAP : -CIRCLE_TEXT_GAP
      })
      .attr("dy", ".31em")
      .attr("text-anchor", function (d) {
        return d.x < 180 ? "start" : "end";
      })
      .attr("transform", function (d) {
        return d.x < 180 ? null : "rotate(180)";
      })
      .text(function (d) {
        return d.name;
      })
      .on("mouseover", events.mouseover)
      .on("mouseout", events.mouseout)
      .on("click", events.mouseClick);
    nodes.append("svg:circle")
      .attr("cx", CIRCLE_SIZE)
      .attr("cy", CIRCLE_SIZE)
      .attr("r", CIRCLE_SIZE)
      .attr("transform", 'translate(' + CIRCLE_LINE_GAP + ',-' + CIRCLE_LINE_GAP + ')')
      .classed('full', function (d) {
        return d.group && d.group.length == CIRCLE_FULL_LIMIT;
      });
    events.updateLinksOnLoad(nodes);
  };
  this.drawConnections = drawConnectionLinks;
  return this;
};
