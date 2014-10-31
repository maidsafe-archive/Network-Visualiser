/** @jsx React.DOM */
window.ConnectionMap = React.createClass({displayName: 'ConnectionMap',
  getInitialState: function() {
    return {connectionMap: null};
  },
  componentDidMount: function() {
    this.props.scope.registerReactComponent(this);
    this.setState({connectionMap: new ConnectionMapBuilder(null, 'conMap')});
  },
  render: function() {
    if (this.state.connectionMap) {
      this.state.connectionMap.drawConnections(this.props.scope.connections);
    }
    return React.DOM.div({id: 'conMap'});
  }
});
