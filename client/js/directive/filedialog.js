var FileDialog = [
  function() {

    var fileDialogLink = function(scope, element, attr, ctrls) {
      var buttonElement = element.find('button');
      var inputElement = element.find('input');

      inputElement.bind("click", function(event) {
        event.stopPropagation();
      });
      buttonElement.bind("click", function(event) {
        event.stopPropagation();
        inputElement.click();
      });

      if (scope.isSingleFile) {
        inputElement.removeAttr("multiple");
      } else {
        inputElement.attr("multiple", "multiple");
      }

      scope.setError = function(msg) {
        scope.$apply(function() {
          scope.selectedFile = null;
          scope.errorMessage = msg;
        });
      };

      scope.setFile = function(file) {
        scope.$apply(function() {
          scope.errorMessage = '';
          scope.selectedFile = file;
        });
      };

      inputElement.bind('change', function(e) {
        if (!e.target.files.length) {
          return;
        }

        var file = e.target.files[0];
        if (file.size > scope.maxFileSizeMb * 1048576) {
          scope.setError('Max file size is ' + scope.maxFileSizeMb + 'mb');
          return;
        }

        scope.setFile(file);
      });
    };

    return {
      restrict: "E",
      replace: true,
      scope: {
        buttonContent: '@',
        buttonClass: '@',
        isSingleFile: '@',
        maxFileSizeMb: '@',
        selectedFile: '=',
        errorMessage: '='
      },
      template: '<span><button class="{{buttonClass}}">{{buttonContent}}</button><input type="file" style="visibility:hidden; height: 0px;" /></span>',
      link: fileDialogLink
    };
  }
]