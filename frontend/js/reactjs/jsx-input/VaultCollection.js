/** @jsx React.DOM */

function onToggleVaultLogsClicked(vaultInfo, componentScope) {
  var scope = componentScope;
  return scope.$apply.bind(
    scope,
    vaultInfo.toggleVaultLogs.bind(vaultInfo)
  );
}

window.LogList = React.createClass({
  render: function() {
    var log = this.props.log;
    var scope = this.props.scope;
    return (
      <li>
        <div className={'log_date'}>
          {log.formattedTime}
        </div>
        <div className={'log_msg'}>
          {scope.vaultManager.vaultBehaviour.formatMessage(log)}
        </div>
      </li>
    );
  }
});

window.VaultNode = React.createClass({
    render: function() {
      var item = this.props.item;
      var scope = this.props.scope;
      var iconPath = "../../imgs/viewer/" + item.stateIcon;
      var hostNameButton;
      if (item.hostName != '') {
        hostNameButton = <a className={'host-name-btn'} title={item.hostName}></a>;
      }
      var toggleVaultLogsHandler = onToggleVaultLogsClicked(item, scope);

      var logs = _.map(item.logs, function(log) {
        return (
          <LogList log={log} scope={scope} key={log.ts} />
        );
      });

        return (
          <div className="node">
            <div className="box">
              <div className="notif">
                <ul>
                  <li className={item.iconsTray.account}></li>
                  <li className={item.iconsTray.chunk}></li>
                  <li className={'shape ' + item.iconsTray.subscriber}>
                    <p>{item.subscriber}</p>
                  </li>
                  <li className={'shape ' + item.iconsTray.counter}>
                    <p>{item.counter}</p>
                  </li>
                </ul>
              </div>
              <div className={'progress ' + (item.networkHealth <= 0 ? 'vault_start' : '')}>
                <div style={item.progressLevel}></div>
              </div>
              <div className={'info ' + item.personaColour}>
                <p>{item.vaultName.substring(0,6).toUpperCase()}</p>
                <img src={iconPath} onClick={toggleVaultLogsHandler} />
                {hostNameButton}
              </div>
            </div>
            <div className={'log_slider ' + (item.logsOpen ? item.personaColour + '_alpha' : 'close')}>
              <ul>
                {logs}
              </ul>
              <div className={'see_history'}>
                <a target="_blank" href={'/history#?id=' + item.vaultName + '&sn=' + scope.sessionName}>See All</a>
              </div>
            </div>
          </div>
        );
    },
    componentDidMount: function () {
      var item = this.props.item;
      item.setReactItem(this);
    }
});

window.VaultCollection = React.createClass({
    render: function() {
        var scope = this.props.scope.$parent;
        var vaultCollection = scope.vaultManager.vaultCollection;

        var rows = _.map(vaultCollection, function(vaultInfo) {
            return (
              <VaultNode item={vaultInfo} scope={scope} key={vaultInfo.vaultName} />
            );
        });

        return (
          <div>{rows}</div>
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