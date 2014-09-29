/** @jsx React.DOM */
/*
* d3.json('/connection_map/data.json', function(data) {
 });
* */
window.ConnectionMap = React.createClass({displayName: 'ConnectionMap',
  getInitialState: function() {
    return {connectionMap: null};
  },
  componentDidMount: function() {
    this.props.scope.registerReactComponent(this);
    this.setState({connectionMap: new ConnectionMapBuilder(null, 'map')});
  },
 render: function () {
   if (this.state.connectionMap) {
     this.state.connectionMap.drawConnections(this.props.scope.connections.slice(0));
   }
   return React.DOM.div({id: 'map'});
  }
});
