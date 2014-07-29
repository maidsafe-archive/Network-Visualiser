/** @jsx React.DOM */

function onToggleVaultLogsClicked(vaultInfo, componentScope) {
  var scope = componentScope;
  return scope.$apply.bind(
    scope,
    vaultInfo.toggleVaultLogs.bind(vaultInfo, null, true)
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
    var iconShapes = scope.vaultManager.vaultBehaviour.iconShapes;
    var iconPath = "../../imgs/viewer/" + item.stateIcon;
    var hostNameButton;
    if (item.hostName != '') {
      hostNameButton = <a className={'host-name-btn'} title={item.hostName}></a>;
    }
    var toggleVaultLogsHandler = onToggleVaultLogsClicked(item, scope);
    var progressWidth = { width: Math.min(Math.max(0, item.networkHealth), 100) + '%'};
    var logs = _.map(item.logs, function(log) {
      return (
        <LogList log={log} scope={scope} key={log.ts} />
      );
    });

    var accountTitle = null, chunkTitle = null, subscriberTitle = null, counterTitle = null;
    if (item.isToolTipEnabled(iconShapes.HEXAGON)) {
      accountTitle = item.lastLog();
    } else if (item.isToolTipEnabled(iconShapes.CIRCLE)) {
      chunkTitle = item.lastLog();
    } else if (item.isToolTipEnabled(iconShapes.SQUARE)) {
      subscriberTitle = item.lastLog();
    } else if (item.isToolTipEnabled(iconShapes.DIAMOND)) {
      counterTitle = item.lastLog();
    }

    var networkHealthTitle = null;
    if (item.logs[item.logs.length - 1].action_id != 18) {
      networkHealthTitle = 'Network Health is ' + item.networkHealth + '%';
    }

    return (
      <div className={'node ' + (!item.isActive ? 'dead' : '' )}>
        <div className="box">
          <div className="notif">
            <ul>
              <li className={item.iconsTray.account} title={accountTitle}></li>
              <li className={item.iconsTray.chunk} title={chunkTitle}></li>
              <li className={'shape ' + item.iconsTray.subscriber} title={subscriberTitle}>
                <p>{item.subscriber}</p>
              </li>
              <li className={'shape ' + item.iconsTray.counter} title={counterTitle}>
                <p>{item.counter}</p>
              </li>
            </ul>
          </div>
          <div className={'progress ' + (item.networkHealth <= 0 ? 'vault_start' : '')} title={networkHealthTitle}>
            <div style={progressWidth}></div>
          </div>
          <div className={'info ' + item.personaColour}>
            <p title={item.fullVaultName}>{item.vaultName.substring(0,6).toUpperCase()}</p>
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
    item.setReactVaultItem(this);
  }
});

window.VaultCollection = React.createClass({
  render: function() {
    var scope = this.props.scope;
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
  componentDidMount: function () {
    var scope = this.props.scope;
    scope.vaultManager.setReactVaultCollectionItem(this);
  },
  componentDidUpdate: function () {
    var scope = this.props.scope;
    if (scope.showLoader) {
      scope.showLoader = false;
    }
  }
});