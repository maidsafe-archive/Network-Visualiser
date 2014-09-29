/** @jsx React.DOM */

window.ConnectionMap = React.createClass({displayName: 'ConnectionMap',
  componentDidMount: function () {
    d3.json('/connection_map/data.json', function (data) {
      DrawConnectionMap(data, 'map');
    });
  },
  render: function () {
    return React.DOM.div({id: 'map'});
  }
});
