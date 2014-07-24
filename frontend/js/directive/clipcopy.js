var ClipCopy = [
  function() {

    var clipCopyLink = function(scope, element, attr, ctrls) {
      ZeroClipboard.config({
        swfPath: "../../components/zeroclipboard/dist/ZeroClipboard.swf",
        trustedDomains: ["*"],
        allowScriptAccess: "always",
        forceHandCursor: true
      });
      var client = new ZeroClipboard(element);
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
    };
    return {
      restrict: 'A',
      scope: false,
      link: clipCopyLink
    };
  }
]