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
          {scope.vaultManager.vaultBehaviour.formatMessage(log, true)}
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
      hostNameButton = <a className={'host-name-btn'} title={item.hostName} ref="hostCopyButton"></a>;
    }
    var toggleVaultLogsHandler = onToggleVaultLogsClicked(item, scope);
    var progressWidth = { width: Math.min(Math.max(0, item.networkHealth), 100) + '%'};

    var networkHealthTitle = null;
    if (item.logs[item.logs.length - 1].action_id != 18) {
      networkHealthTitle = 'Network Health is ' + item.networkHealth + '%';
    }

    var logsItem;
    if (item.logsOpen) {
      var sortedLogs = item.logs.sort(function (leftItem, rightItem) {
        var leftTime = new Date(leftItem.ts).getTime();
        var rightTime = new Date(rightItem.ts).getTime();
        return rightTime - leftTime;
      });
      var logs = _.map(sortedLogs, function (log) {
        return (
          <LogList log={log} scope={scope} key={log.uniqueCount} />
        );
      });

      logsItem = (
        <div className={'log_slider ' + item.personaColour + '_alpha'}  ref="logsPreviewList">
          <ul>
            {logs}
          </ul>
          <div className={'see_history'}>
            <a target="_blank" href={'/history#?id=' + item.vaultName + '&sn=' + scope.sessionName}>See All</a>
          </div>
        </div>
      );
    }

    return (
      <div className={'node ' + (!item.isActive ? 'dead ' : '' ) + (scope.zoomClass || 'large')}>
        <div className="message-bar">
          <input type="text" value={item.alertMessage} readOnly />
        </div>
        <div className="box">
          <div className="notif">
              <div className={item.iconsTray.account}></div>
              <div className={item.iconsTray.chunk}></div>
              <div className={'shape ' + item.iconsTray.subscriber}>
                <span>{item.subscriber}</span>
              </div>
              <div className={'shape ' + item.iconsTray.counter}>
                <span>{item.counter}</span>
              </div>
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
        {logsItem}
      </div>
    );
  },
  componentDidMount: function () {
    var item = this.props.item;
    item.setReactVaultItem(this);

    if (!this.refs || !this.refs.hasOwnProperty('hostCopyButton')) {
      return;
    }

    var domNode = this.refs['hostCopyButton'].getDOMNode();
    var client = new ZeroClipboard(domNode);
    client.on('ready', function() {
      item.zeroClipboardObject = client;
      client.on('copy', function(event) {
        var clipboard = event.clipboardData;
        var copyText = domNode.title || "Unknown host-name";
        clipboard.setData('text/plain', copyText);
      });
    });
  },
  componentDidUpdate: function() {
    if (!this.refs || !this.refs.hasOwnProperty('logsPreviewList')) {
      return
    }

    var domNode = this.refs['logsPreviewList'].getDOMNode();
    $(domNode).unbind("mousewheel");

    if (!this.props.item.logsOpen) {
      return;
    }

    $(domNode).bind('mousewheel', function(element, delta){
      var thisObject = $(this);

      if (delta > 0 && thisObject.scrollTop() === 0) {
        element.preventDefault();
      } else {
        var adjustedHeight = thisObject.scrollTop() - thisObject.get(0).scrollHeight + thisObject.innerHeight();
        if (delta < 0 && (adjustedHeight >= -1 && adjustedHeight <= 1)) {
          element.preventDefault();
        }
      }
    });
  },
  componentWillUnmount: function() {
    if (this.refs && this.refs.hasOwnProperty('logsPreviewList')) {
      var domNode = this.refs['logsPreviewList'].getDOMNode();
      $(domNode).unbind("mousewheel");
    }

    var clipboardItem = this.props.item.zeroClipboardObject;
    if (clipboardItem) {
      clipboardItem.destroy();
    }
  }
});

window.VaultCollection = React.createClass({
  getInitialState: function() {
    ZeroClipboard.config({
      swfPath: "../../../components/zeroclipboard/dist/ZeroClipboard.swf",
      trustedDomains: ["*"],
      allowScriptAccess: "always",
      forceHandCursor: true
    });
    return {
      renderedItemsCount: 0
    };
  },
  render: function() {
    var scope = this.props.scope;
    var vaultCollection = scope.vaultManager.vaultCollection;
    var totalVaultsCount = vaultCollection.length;
    var renderedItemsCount = Math.min(this.state.renderedItemsCount, totalVaultsCount);
    vaultCollection = vaultCollection.slice(0, renderedItemsCount);
    var rows = _.map(vaultCollection, function(vaultInfo) {
      return (
        <VaultNode item={vaultInfo} scope={scope} key={vaultInfo.vaultName} />
      );
    });

    return (
      <React.addons.InfiniteScroll pageStart={0}
                                   loadMore={this.loadMoreVaults}
                                   hasMore={renderedItemsCount < totalVaultsCount}
                                   loader={<div>Loading ...</div>}
                                   scrollElement={document.getElementById('wrapper')}>
        <div>{rows}</div>
      </React.addons.InfiniteScroll>
    );
  },
  loadMoreVaults: function() {
    this.setState({
      renderedItemsCount: this.state.renderedItemsCount + 50
    });
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