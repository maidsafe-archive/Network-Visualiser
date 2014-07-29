/** @jsx React.DOM */

function onToggleVaultLogsClicked(vaultInfo, componentScope) {
  var scope = componentScope;
  return scope.$apply.bind(
    scope,
    vaultInfo.toggleVaultLogs.bind(vaultInfo)
  );
}

window.LogList = React.createClass({displayName: 'LogList',
  render: function() {
    var log = this.props.log;
    var scope = this.props.scope;
    return (
      React.DOM.li(null, 
        React.DOM.div({className: 'log_date'}, 
          log.formattedTime
        ), 
        React.DOM.div({className: 'log_msg'}, 
          scope.vaultManager.vaultBehaviour.formatMessage(log)
        )
      )
    );
  }
});

window.VaultNode = React.createClass({displayName: 'VaultNode',
    render: function() {
      var item = this.props.item;
      var scope = this.props.scope;
      var iconPath = "../../imgs/viewer/" + item.stateIcon;
      var hostNameButton;
      if (item.hostName != '') {
        hostNameButton = React.DOM.a({className: 'host-name-btn', title: item.hostName});
      }
      var toggleVaultLogsHandler = onToggleVaultLogsClicked(item, scope);

      var logs = _.map(item.logs, function(log) {
        return (
          LogList({log: log, scope: scope, key: log.ts})
        );
      });

        return (
          React.DOM.div({className: "node"}, 
            React.DOM.div({className: "box"}, 
              React.DOM.div({className: "notif"}, 
                React.DOM.ul(null, 
                  React.DOM.li({className: item.iconsTray.account}), 
                  React.DOM.li({className: item.iconsTray.chunk}), 
                  React.DOM.li({className: 'shape ' + item.iconsTray.subscriber}, 
                    React.DOM.p(null, item.subscriber)
                  ), 
                  React.DOM.li({className: 'shape ' + item.iconsTray.counter}, 
                    React.DOM.p(null, item.counter)
                  )
                )
              ), 
              React.DOM.div({className: 'progress ' + (item.networkHealth <= 0 ? 'vault_start' : '')}, 
                React.DOM.div({style: item.progressLevel})
              ), 
              React.DOM.div({className: 'info ' + item.personaColour}, 
                React.DOM.p(null, item.vaultName.substring(0,6).toUpperCase()), 
                React.DOM.img({src: iconPath, onClick: toggleVaultLogsHandler}), 
                hostNameButton
              )
            ), 
            React.DOM.div({className: 'log_slider ' + (item.logsOpen ? item.personaColour + '_alpha' : 'close')}, 
              React.DOM.ul(null, 
                logs
              ), 
              React.DOM.div({className: 'see_history'}, 
                React.DOM.a({target: "_blank", href: '/history#?id=' + item.vaultName + '&sn=' + scope.sessionName}, "See All")
              )
            )
          )
        );
    },
    componentDidMount: function () {
      var item = this.props.item;
      item.setReactItem(this);
    }
});

window.VaultCollection = React.createClass({displayName: 'VaultCollection',
    render: function() {
        var scope = this.props.scope.$parent;
        var vaultCollection = scope.vaultManager.vaultCollection;

        var rows = _.map(vaultCollection, function(vaultInfo) {
            return (
              VaultNode({item: vaultInfo, scope: scope, key: vaultInfo.vaultName})
            );
        });

        return (
          React.DOM.div(null, rows)
        );
    },
    componentDidUpdate: function () {
      var scope = this.props.scope.$parent;
      if (scope.showLoader) {
        console.log('called');
        scope.showLoader = false;
      }
    }
});