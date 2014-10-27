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
            {scope.vaultBehaviour.personas[item.personaId]}
        </td>
        <td style={{ width: '10%'}}>
            {scope.vaultBehaviour.actions[item.actionId]}
        </td>
        <td style={{ width: '35%', 'word-break': 'break-all'}}>
          <div>
              {item.valueOne}
          </div>
        </td>
        <td style={{ width: '35%', 'word-break': 'break-all'}}>
          <div>
              {item.valueTwo}
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

    var rows = _.map(logsCollection, function(log) {
      return (
        <LogRow item={log} scope={scope} key={log.logIndex} />
      );
    });

    return (
      <div>
        <React.addons.InfiniteScroll pageStart={0}
                                     loadMore={this.loadMoreLogs}
                                     hasMore={scope.paging.hasMore}
                                     loader={<div className="loader"><div className="loader-animation"></div>Loading ...</div>}>
          <table>
            {rows}
          </table>
        </React.addons.InfiniteScroll>
        {scope.paging.hasMore ? <div style={{ 'height':'25px'}}></div> : null}
      </div>
    );
  },
  componentDidMount: function () {
    var scope = this.props.scope;
    scope.setReactLogsCollectionItem(this);
  },
  loadMoreLogs: function() {
    var scope = this.props.scope;
    scope.loadNextPage();
  },
  filterLogs: function(element) {
    var scope = this.props.scope;
    var logText = element.ts + scope.vaultBehaviour.personas[element.personaId] +
                  scope.vaultBehaviour.actions[element.actionId] + element.valueOne + element.valueTwo;
    return logText.toLowerCase().indexOf(scope.searchText.toLowerCase()) > -1;
  }
});