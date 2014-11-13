/** @jsx React.DOM */

window.ConnectionMap = React.createClass({displayName: 'ConnectionMap',
  getInitialState: function() {
    return {connectionMap: null};
  },
  componentDidMount: function() {
    this.props.scope.registerReactComponent(this);
    this.setState({connectionMap: null});
  },
  render: function() {
    if (!this.props.scope.connections || this.props.scope.connections.length === 0) {
      return React.DOM.div({id: 'conMap'});
    }
    if (!this.state.connectionMap) {
      this.state.connectionMap = new ConnectionMapBuilder(null, 'conMap')
    }
    this.state.connectionMap.drawConnections(this.props.scope.connections);
    return React.DOM.div({id: 'conMap'});
  }
});
