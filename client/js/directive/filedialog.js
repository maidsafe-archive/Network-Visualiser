var FileDialog = [
  function() {
    var buttonElement = null;
    var inputElement = null;

    var fileDialogLink = function(scope, element, attr, ctrls) {
      buttonElement = element.find('button');
      resetFileInput(scope);

      buttonElement.bind("click", function(event) {
        event.stopPropagation();
        if (inputElement) {
          inputElement.click();
        }
      });

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

      scope.$watch('resetInputFile', function() {
        if (scope.resetInputFile) {
          resetFileInput(scope);
        }
      });
    };

    var resetFileInput = function(scope) {
      if (inputElement != null) {
        inputElement.remove();
      }

      var input = document.createElement("input");
      var inputAttr = document.createAttribute("type");
      inputAttr.nodeValue = "file";
      input.setAttributeNode(inputAttr);

      inputAttr = document.createAttribute("style");
      inputAttr.nodeValue = "visibility:hidden; height: 0px;";
      input.setAttributeNode(inputAttr);


      if (!scope.isSingleFile) {
        inputAttr = document.createAttribute("multiple");
        inputAttr.nodeValue = "multiple";
        input.setAttributeNode(inputAttr);
      }

      buttonElement.after(input);
      inputElement = angular.element(input);

      inputElement.bind("click", function(event) {
        event.stopPropagation();
      });

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

      scope.resetInputFile = false;
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
        errorMessage: '=',
        resetInputFile: '='
      },
      template: '<span><button class="{{buttonClass}}">{{buttonContent}}</button></span>',
      link: fileDialogLink
    };
  }
]