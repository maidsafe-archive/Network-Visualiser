function isChrome() {
  return navigator.userAgent.search("Chrome") >= 0;
}

function isValidQuery(searchParameter) {
  var regExp = /^([1-9][0-9]{0,2}) ?%?$/;
  var matches = regExp.exec(searchParameter);
  if (matches != null) {
    $(".wrapper").css({ "zoom": matches[1] + "%" });
    console.log("called");
  }
}

(function($) {
  $.widget("ui.combobox", {
    _create: function() {
      var self = this,
          select = this.element.hide(),
          selected = select.children(":selected"),
          value = "100%",
          buttonClicked = false;
      var input = this.input = $("<input>")
        .insertAfter(select)
        .val(value)
        .autocomplete({
          delay: 0,
          minLength: 0,
          source: function(request, response) {
            if (!buttonClicked) {
              isValidQuery(request.term);
              return {};
            }

            response(select.children("option").map(function() {
              var text = $(this).text();
              return {
                label: text,
                value: text,
                option: this
              };
            }));
          },
          select: function(event, ui) {
            isValidQuery(ui.item.option.value);
            ui.item.option.selected = true;
            self._trigger("selected", event, {
              item: ui.item.option
            });
          }
        })
        .addClass("ui-widget ui-widget-content ui-corner-left");
      this.button = $("<button type='button'>&nbsp;</button>")
        .attr("tabIndex", -1)
        .attr("title", "Show All Items")
        .insertAfter(input)
        .button({
          icons: {
            primary: "ui-icon-triangle-1-s"
          },
          text: false
        })
        .removeClass("ui-corner-all")
        .addClass("ui-corner-right ui-button-icon")
        .click(function() {
          // close if already visible
          if (input.autocomplete("widget").is(":visible")) {
            input.autocomplete("close");
            return;
          }
          // work around a bug (likely same cause as #5265)
          $(this).blur();
          // pass empty string as value to search for, displaying all results
          buttonClicked = true;
          input.autocomplete("search", "");
          buttonClicked = false;
          input.focus();
        });
    }
  });
})(jQuery);
$(function() {
  if (isChrome()) {
    $("#selLanguage").combobox();
    $("#non-chrome").hide();
  } else {
    $(".zoom").hide();
  }
});