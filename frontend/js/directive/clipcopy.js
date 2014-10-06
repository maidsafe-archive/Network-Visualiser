/* global window:false */

window.ClipCopy = [
  function() {
    var clipCopyLink = function(scope, element) {
      window.ZeroClipboard.config({
        swfPath: '../../components/zeroclipboard/dist/ZeroClipboard.swf',
        trustedDomains: ['*'],
        allowScriptAccess: 'always',
        forceHandCursor: true
      });
      var client = new window.ZeroClipboard(element);
      // jshint unused:false
      client.on('ready', function(readyEvent) {
        client.on('copy', function(event) {
          var clipboard = event.clipboardData;
          var copyText = element.attr('clip-text');
          clipboard.setData('text/plain', copyText);
        });
        scope.$on('$destroy', function() {
          client.destroy();
        });
      });
      // jshint unused:true
    };
    return {
      restrict: 'A',
      scope: false,
      link: clipCopyLink
    };
  }
];
