function ConnectionEvents(svg) {
	var GROUP_CLASS = "group", OVERLAPPING_TARGET_CLASS = 'overlaped-target', CLOSE_GROUP_CLASS = 'close-group', 
	MISSING_EXPECTED = 'missing-expected', NOT_EXPECTED_CLASS = "not-expected", VAULT_ENTERED_CLASS = "in", 
	VAULT_LEFT_CLASS = "out", GREY_LINK_CLASS = 'grey', TEXT_NODE_SELECTED_CLASS = 'selected', CLOSE_GROUP_LIMIT = 4,
	GROUP_LIMIT = 16, LINK_MODE = {CONNECTIVITY: 1, CHURN: 2};
	var mode = LINK_MODE.CONNECTIVITY;
	
	var clickEvent = { state: false, node: null};

	var updateConnectionLinks = function(svg, node) {
		revertConnections(svg);
		svg.select('svg g#node-' + node.name + ' text').classed(TEXT_NODE_SELECTED_CLASS, true);
		svg.selectAll('.link').classed(GREY_LINK_CLASS, true);
		if (node.group) {
			if (mode === LINK_MODE.CONNECTIVITY) {
				node.group.slice(0, CLOSE_GROUP_LIMIT).forEach(function(vaultName) {
					svg.select('g#node-' + vaultName + ' text').classed('blue', true);
					svg.selectAll("path.link.source-" + node.name + ".target-" + vaultName).classed(CLOSE_GROUP_CLASS, true)
				});
			}
			if (mode == LINK_MODE.CHURN) {
				var className, labelClass;
				node.group.forEach(function(d) {	
					if (d === node.lastIn) {
						className = VAULT_ENTERED_CLASS;
						labelClass = 'green';
					} else if (d === node.lastOut) {
						className = VAULT_LEFT_CLASS;
						labelClass = 'red';
					} else {
						className = GROUP_CLASS;
						labelClass = 'light-blue';
					}
					svg.select('g#node-' + d + ' text').classed(labelClass, true);
					svg.selectAll("path.link.source-" + node.name + ".target-" + d).classed(className, true);
				});
			}
			svg.selectAll("path.link.target-" + node.name).classed(OVERLAPPING_TARGET_CLASS, true);
		}
		if (node.expected && mode === LINK_MODE.CONNECTIVITY) {
			var actual = node.group.slice(0, CLOSE_GROUP_LIMIT);
			node.expected.forEach(function(expected) {
				if (actual.indexOf(expected) === -1) {
					svg.select('g#node-' + expected + ' text').classed('blue', false).classed('red', true);
					svg.selectAll("path.link.source-" + node.name + ".target-" + expected).
					classed(CLOSE_GROUP_CLASS, false).
					classed(MISSING_EXPECTED, true);
				}
			});
			actual.forEach(function(vaultName) {
				if (node.expected.indexOf(vaultName) === -1) {
					svg.select('g#node-' + vaultName + ' text').classed('blue', false).classed('orange', true);
					svg.selectAll("path.link.source-" + node.name + ".target-" + vaultName)
					.classed(GROUP_CLASS, false)
					.classed(CLOSE_GROUP_CLASS, false)
					.classed(MISSING_EXPECTED, false)
					.classed(NOT_EXPECTED_CLASS, true);
				}
			});
		}
	};
	
	var revertConnections = function(node) {
		if (clickEvent.state) {
			return;
		}
		var linkClasses = [OVERLAPPING_TARGET_CLASS, GROUP_CLASS, GREY_LINK_CLASS, VAULT_ENTERED_CLASS, VAULT_LEFT_CLASS, MISSING_EXPECTED, 		NOT_EXPECTED_CLASS, CLOSE_GROUP_CLASS];
		var textClasses = ['blue', 'green', 'red', 'orange', 'light-blue'];
		linkClasses.forEach(function(className) {
			svg.selectAll('path.link.' + className).classed(className, false);
		});
		textClasses.forEach(function(className) {
			svg.selectAll('g.node text').classed(className, false);
		});
		svg.selectAll("path.link.source-" + node.name)
			.classed("source", false)
			.each(updateNodes("target", false));

		svg.selectAll("path.link.target-" + node.name)
			.classed("target", false)
			.each(updateNodes("source", false));
		svg.select('g text.selected').classed(TEXT_NODE_SELECTED_CLASS, false);
		
	};

 var showConnections = function(d) {	 
		svg.selectAll("path.link.target-" + d.name)
				.classed("target", true)		
			.each(updateNodes("source", true));

		svg.selectAll("path.link.source-" + d.name)
				.classed("source", true)
				.each(updateNodes("target", true));
		updateConnectionLinks(svg, d);
 };
 
 function updateNodes(name, value) {				
		return function(d) {
			if (value) {
				this.parentNode.appendChild(this);
			}
			svg.select("#node-" + d[name].name).classed(name, value);
		};
	};

	function cross(a, b) {
		return a[0] * b[1] - a[1] * b[0];
	};

	function dot(a, b) {
		return a[0] * b[0] + a[1] * b[1];
	};
	
	this.mousedown = function() {
		if (!clickEvent.state) {
		 return;
		}
		clickEvent.state = false;
		revertConnections(clickEvent.node);	 	
 	};
	this.mouseClick = function(d) {
		if(clickEvent.state){
			clickEvent.state = false;
			revertConnections(clickEvent.node);
		}		
		clickEvent.state = true;
		clickEvent.node = d;		
		showConnections(d);
	}
				
  this.mouseover = function(d) {
		if(!clickEvent.state){
			showConnections(d);
		}
	};
	
	this.setMode = function(_mode){
		mode = _mode;
		if(!clickEvent.node){
			return;
		}
		if (clickEvent.state) {
			clickEvent.state = false;
			revertConnections(clickEvent.node);
			clickEvent.state = true;
			showConnections(clickEvent.node);
		}		
	}		

	this.mouseout = revertConnections;
			
	return this;
};