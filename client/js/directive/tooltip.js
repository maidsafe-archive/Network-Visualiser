var ToolTip = [
  '$compile', function($compile) {

    var parent = angular.element(document.getElementsByTagName('body')[0]);
    var tooltip = function(scope, element, attr, ctrls) {

      var ele;
      var style = 'position:fixed;background-color:#fff;padding:.5em;border:1px solid;border-radius:6px;z-index:999';
      scope.tip = attr.tooltip;
      scope.enabled = attr['canshow'] || "true";
      var show = function(e) {
        if (!ele && scope.enabled == "true") {
          ele = $compile('<div style="' + style + ";top:" + e.clientY + 'px;left:' + e.clientX + 'px' + '">{{tip}}</div>')(scope);
          scope.$apply();
          parent.append(ele);
        }
      };
      element.on('mouseover', function(e) {
        show(e);
      });
      element.on('mouseout', function() {
        if (ele) {
          ele.remove();
          ele = null;
        }
      });


      scope.$watch(function() { return element.attr('tooltip'); }, function(n) {
        scope.tip = n;
      });
      scope.$watch(function() { return element.attr('canshow'); }, function(n) {
        scope.enabled = n;
      });
    };
    return {
      restrict: "A",
      scope: true,
      link: tooltip
    };
  }
]