/** @jsx React.DOM */


window.ReactItem = React.createClass({displayName: 'ReactItem',
    render: function() {
        var item = this.props.scope;
        return (
            React.DOM.div(null, 
                React.DOM.div(null, "Id: ", item.vaultName), 
                React.DOM.div(null, "Health - ", item.networkHealth), 
                React.DOM.div(null, "Full Name - ", item.fullVaultName.substring(0,30)), 
                React.DOM.div(null, "Last Log - ", item.lastLog())
            )
        );
    }
});

window.ReactItemList = React.createClass({displayName: 'ReactItemList',
    render: function() {
        var scope = this.props.scope;
        var items = scope.vaults;

        var rows = _.map(items, function(item) {
            return (
                ReactItem({item: item, scope: scope})
            );
        });

        return (
            React.DOM.div(null, rows)
        );
    }
});