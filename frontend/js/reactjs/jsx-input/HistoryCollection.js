/** @jsx React.DOM */

window.LogRow = React.createClass({
  render: function() {
    var item = this.props.item;
    var scope = this.props.scope;

    return (
      <tr>
        <td style={{ width: '12.5%'}}>
            {item.ts}
        </td>
        <td style={{ width: '10%'}}>
            {scope.vaultBehaviour.personas[item.persona_id]}
        </td>
        <td style={{ width: '10%'}}>
            {scope.vaultBehaviour.actions[item.action_id]}
        </td>
        <td style={{ width: '35%'}}>
          <div>
              {item.value1}
          </div>
        </td>
        <td style={{ width: '35%'}}>
          <div>
              {item.value2}
          </div>
        </td>
      </tr>
    );
  }
});

window.HistoryCollection = React.createClass({
  getInitialState: function() {
    return {
      renderedItemsCount: 0
    };
  },
  render: function() {
    var scope = this.props.scope;
    var logsCollection = scope.logs;
    var totalLogsCount = logsCollection.length;
    var renderedItemsCount = Math.min(this.state.renderedItemsCount, totalLogsCount);
    logsCollection = logsCollection.slice(0, renderedItemsCount);
    if (scope.searchText && scope.searchText != '') {
      logsCollection = logsCollection.filter(this.filterLogs);
    }

    var rows = _.map(logsCollection, function(log) {
      return (
        <LogRow item={log} scope={scope} key={log.logIndex} />
      );
    });

    return (
      <React.addons.InfiniteScroll pageStart={0}
                                   loadMore={this.loadMoreLogs}
                                   hasMore={renderedItemsCount < totalLogsCount}
                                   loader={<div>Loading ...</div>}>
        <table>
          <thead>
            <td className="timestamp-head">Timestamp</td>
            <td className="persona-head">Persona</td>
            <td className="action-head">Action</td>
            <td className="value1-head">Value 1</td>
            <td className="value2-head">Value 2</td>
          </thead>
          {rows}
        </table>
      </React.addons.InfiniteScroll>
    );
  },
  componentDidMount: function () {
    var scope = this.props.scope;
    scope.setReactLogsCollectionItem(this);
  },
  loadMoreLogs: function() {
    setTimeout(function () {
      this.setState({
        renderedItemsCount: this.state.renderedItemsCount + 50
      });
    }.bind(this), 500);
  },
  filterLogs: function(element) {
    var scope = this.props.scope;
    var logText = element.ts + scope.vaultBehaviour.personas[element.persona_id] +
                  scope.vaultBehaviour.actions[element.action_id] + element.value1 + element.value2;
    return logText.toLowerCase().indexOf(scope.searchText.toLowerCase()) > -1;
  }
});