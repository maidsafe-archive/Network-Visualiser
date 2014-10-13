/** @jsx React.DOM */

window.LogRow = React.createClass({displayName: 'LogRow',
  render: function() {
    var item = this.props.item;
    var scope = this.props.scope;

    return (
      React.DOM.tr(null, 
        React.DOM.td({style: { width: '12.5%'}}, 
            item.ts
        ), 
        React.DOM.td({style: { width: '10%'}}, 
            scope.vaultBehaviour.personas[item.personaId]
        ), 
        React.DOM.td({style: { width: '10%'}}, 
            scope.vaultBehaviour.actions[item.actionId]
        ), 
        React.DOM.td({style: { width: '35%', 'word-break': 'break-all'}}, 
          React.DOM.div(null, 
              item.valueOne
          )
        ), 
        React.DOM.td({style: { width: '35%', 'word-break': 'break-all'}}, 
          React.DOM.div(null, 
              item.valueTwo
          )
        )
      )
    );
  }
});

window.HistoryCollection = React.createClass({displayName: 'HistoryCollection',
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
        LogRow({item: log, scope: scope, key: log.logIndex})
      );
    });

    return (
      React.DOM.div(null, 
        React.addons.InfiniteScroll({pageStart: 0, 
                                     loadMore: this.loadMoreLogs, 
                                     hasMore: renderedItemsCount < totalLogsCount, 
                                     loader: React.DOM.div({className: "loader"}, React.DOM.div({className: "loader-animation"}), "Loading ...")}, 
          React.DOM.table(null, 
            rows
          )
        ), 
         totalLogsCount == renderedItemsCount ? React.DOM.div({style: { 'height':'25px'}}) : null
      )
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
    var logText = element.ts + scope.vaultBehaviour.personas[element.personaId] +
                  scope.vaultBehaviour.actions[element.actionId] + element.valueOne + element.valueTwo;
    return logText.toLowerCase().indexOf(scope.searchText.toLowerCase()) > -1;
  }
});