/** @jsx React.DOM */


window.ReactItem = React.createClass({
    render: function() {
        var item = this.props.scope;
        return (
            <div>
                <div>Id: {item.vaultName}</div>
                <div>Health - {item.networkHealth}</div>
                <div>Full Name - {item.fullVaultName.substring(0,30)}</div>
                <div>Last Log - {item.lastLog()}</div>
            </div>
        );
    }
});

window.ReactItemList = React.createClass({
    render: function() {
        var scope = this.props.scope;
        var items = scope.vaults;

        var rows = _.map(items, function(item) {
            return (
                <ReactItem item={item} scope={scope} />
            );
        });

        return (
            <div>{rows}</div>
        );
    }
});