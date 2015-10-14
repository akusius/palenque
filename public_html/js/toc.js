jQuery(function ($) {
  var LoadState = function (elements) {
    this.state = "toload";
    this.setState = function (state) {
      var oldState = this.state;
      $.each(elements, function () {
        $(this).removeClass(oldState);
      });
      this.state = state;
      $.each(elements, function () {
        $(this).addClass(state);
      });
    };
  };
  LoadState.prototype.get = function () {
    return this.state;
  };
  LoadState.prototype.set = function (state) {
    var oldStates = {
      "loading": "toload",
      "loaded": "loading",
      "error": "loading"
    };
    if (!oldStates.hasOwnProperty(state)) {
      throw "Invalid new state!";
    }
    if (oldStates[state] !== this.state) {
      throw "Invalid state change: " + this.state + " -> " + state;
    }
    this.setState(state);
  };

  var Toc = function ($toc, $tocButton) {
    this.$toc = $toc;
    this.loadState = new LoadState([$toc, $tocButton]);
    this.construct = function (xml) {
      var createList = function ($parentPage) {
        var $childPages = $parentPage.children("Page");
        if ($childPages.size() <= 0) {
          return null;
        }

        var ul = document.createElement("ul");

        $childPages.each(function () {
          var li = document.createElement("li");

          var page = this.getAttribute("name");
          var elem;
          if (location.pathname.indexOf("/" + page) >= 0) {
            // Current page
            elem = document.createElement("span");
            li.className = "current";
          } else {
            // Other page
            elem = document.createElement("a");
            elem.href = page;
            li.className = "selectable";
          }

          elem.className = "page";
          var text = this.getAttribute("title");
          var idx = text.indexOf("|");
          if (idx >= 0) {
            text = text.substr(0, idx);
          }
          text = $.trim(text);
          elem.innerHTML = text;
          elem.title = $.trim(this.getAttribute("desc"));
          li.appendChild(elem);

          var list = createList($(this));
          if (list !== null) {
            li.appendChild(list);
          }
          ul.appendChild(li);
        });

        return ul;
      };

      var $index = $(xml).find("Toc > Page[name='index.html']");
      var mainList = createList($index);
      mainList.className = "main";

      var searchBox = document.createElement("input");
      searchBox.type = "text";
      searchBox.placeholder = "Search";
      searchBox.autocomplete = "off";

      this.$toc.empty();
      this.$toc.append([searchBox, mainList]);

      var toc = this;

      this.$toc.find("input").keydown(function (e) {
        if (e.which === 13) {   // Enter
          toc.jump();
          return false;
        }
        if (e.which === 27) {   // Escape
          toc.close();
          return false;
        }
        if (e.which === 38) {   // Up
          toc.select("prev");
          return false;
        }
        if (e.which === 40) {   // Down
          toc.select("next");
          return false;
        }
      });
      this.$toc.find("input").on("input", function () {
        toc.filter($(this).val());
      });
    };
  };
  Toc.prototype.hasError = function () {
    return this.loadState.get() === "error";
  };
  Toc.prototype.load = function (cont) {
    if (this.loadState.get() !== "toload") {
      return;
    }
    this.loadState.set("loading");

    var _this = this;

    $.ajax({
      url: "toc.xml",
      type: "GET",
      dataType: "xml"
    }).done(function (data) {
      _this.loadState.set("loaded");
      _this.construct(data);
      cont.call(_this);
    }).fail(function () {
      _this.loadState.set("error");
    });
  };
  Toc.prototype.needsLoading = function () {
    return this.loadState.get() === "toload";
  };
  Toc.prototype.filter = function (s) {
    this.$toc.find("li").removeClass("hidden visible-child");

    if (s) {
      var words = s.toLowerCase().split(/[\s,]+/).filter(Boolean);

      this.$toc.find(".page").each(function () {
        var text = this.innerHTML.toLowerCase();
        var match = true;

        $.each(words, function () {
          if (text.indexOf(this) < 0) {
            match = false;
            return false;
          }
        });

        if (match) {
          $(this).parentsUntil("#toc", "li").slice(1).addClass("visible-child");
        } else {
          $(this).closest("li").addClass("hidden");
        }
      });
    }

    this.select("first");
  };
  Toc.prototype.select = function (what) {
    var $items = this.$toc.find("li.selectable");
    var $selected = $items.filter(".selected:not(.hidden)").first();
    $items.removeClass("selected");
    $items = $items.not(".hidden");
    if ($items.size() <= 0) {
      return;
    }
    var selIndex = $items.index($selected);
    var maxIndex = $items.size() - 1;

    var newIndex = 0;
    if (what === "next") {
      newIndex = selIndex + 1;
      if (newIndex > maxIndex) {
        newIndex = 0;
      }
    } else if (what === "prev") {
      newIndex = selIndex - 1;
      if (newIndex < 0) {
        newIndex = maxIndex;
      }
    }

    newIndex = Math.max(0, Math.min(newIndex, maxIndex));

    var $selected = $items.eq(newIndex);
    $selected.addClass("selected");

    var scrollIntoViewIfNeeded = function ($e) {
      var top = $e.position().top;
      var bottom = top + $e.height();
      var op = $e.offsetParent();
      var height = op.height();
      var scrollTop = op.scrollTop();

      if (top < 0) {
        op.scrollTop(scrollTop + top);
      } else if (bottom > height) {
        op.scrollTop(scrollTop + bottom - height);
      }
    };
    scrollIntoViewIfNeeded($selected.children("a"));
  };
  Toc.prototype.jump = function () {
    var $page = this.$toc.find("li.selected a").first();
    if ($page.size() > 0) {
      location.href = $page.attr("href");
    }
  };
  Toc.prototype.isOpen = function () {
    return this.$toc.hasClass("open");
  };
  Toc.prototype.open = function () {
    if (this.hasError() || this.isOpen()) {
      return;
    }
    var loaded = function () {
      this.$toc.addClass("open");
      var $input = this.$toc.find("input");
      $input.val("");
      this.filter("");
      $input.focus();
    };
    if (this.needsLoading()) {
      this.load(loaded);
    } else {
      loaded.call(this);
    }
  };
  Toc.prototype.close = function () {
    if (!this.isOpen()) {
      return;
    }
    this.$toc.removeClass("open");
  };
  Toc.prototype.toggle = function () {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  };

  var $tocButton = $("#navigation a.toc");
  var $toc = $("#toc");

  var toc = new Toc($toc, $tocButton);

  $tocButton.click(function () {
    toc.toggle();
    return false;
  });
});

