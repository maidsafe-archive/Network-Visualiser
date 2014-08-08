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
            scope.vaultBehaviour.personas[item.persona_id]
        ), 
        React.DOM.td({style: { width: '10%'}}, 
            scope.vaultBehaviour.actions[item.action_id]
        ), 
        React.DOM.td({style: { width: '35%'}}, 
          React.DOM.div(null, 
              item.value1
          )
        ), 
        React.DOM.td({style: { width: '35%'}}, 
          React.DOM.div(null, 
              item.value2
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
      React.addons.InfiniteScroll({pageStart: 0, 
                                   loadMore: this.loadMoreLogs, 
                                   hasMore: renderedItemsCount < totalLogsCount, 
                                   loader: React.DOM.div(null, "Loading ...")}, 
        React.DOM.table(null, 
          React.DOM.thead(null, 
            React.DOM.td({className: "timestamp-head"}, "Timestamp"), 
            React.DOM.td({className: "persona-head"}, "Persona"), 
            React.DOM.td({className: "action-head"}, "Action"), 
            React.DOM.td({className: "value1-head"}, "Value 1"), 
            React.DOM.td({className: "value2-head"}, "Value 2")
          ), 
          rows
        )
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
    var logText = element.ts + scope.vaultBehaviour.personas[element.persona_id] +
                  scope.vaultBehaviour.actions[element.action_id] + element.value1 + element.value2;
    return logText.toLowerCase().indexOf(scope.searchText.toLowerCase()) > -1;
  }
});