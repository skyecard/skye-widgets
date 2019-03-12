/*
    A simple jQuery modal (http://github.com/kylefox/jquery-modal)
    Version 0.9.2
*/

(function (factory) {
  // Making your jQuery plugin work better with npm tools
  // http://blog.npmjs.org/post/112712169830/making-your-jquery-plugin-work-better-with-npm
  if(typeof module === "object" && typeof module.exports === "object") {
    factory(require("jquery"), window, document);
  }
  else {
    factory(jQuery, window, document);
  }
}(function($, window, document, undefined) {

  var skyeModals = [],
      getCurrent = function() {
        return skyeModals.length ? skyeModals[skyeModals.length - 1] : null;
      },
      selectCurrent = function() {
        var i,
            selected = false;
        for (i=skyeModals.length-1; i>=0; i--) {
          if (skyeModals[i].$blocker) {
            skyeModals[i].$blocker.toggleClass('current',!selected).toggleClass('behind',selected);
            selected = true;
          }
        }
      };

  $.skyeModal = function(el, options) {
    var remove, target;
    this.$body = $('body');
    this.options = $.extend({}, $.skyeModal.defaults, options);
    this.options.doFade = !isNaN(parseInt(this.options.fadeDuration, 10));
    this.$blocker = null;
    if (this.options.closeExisting)
      while ($.skyeModal.isActive())
        $.skyeModal.close(); // Close any open modals.
    skyeModals.push(this);
    if (el.is('a')) {
      target = el.attr('href');
      this.anchor = el;
      //Select element by id from href
      if (/^#/.test(target)) {
        this.$elm = $(target);
        if (this.$elm.length !== 1) return null;
        this.$body.append(this.$elm);
        this.open();
      //AJAX
      } else {
        this.$elm = $('<div>');
        this.$body.append(this.$elm);
        remove = function(event, skyeModal) { skyeModal.elm.remove(); };
        this.showSpinner();
        el.trigger($.skyeModal.AJAX_SEND);
        $.get(target).done(function(html) {
          if (!$.skyeModal.isActive()) return;
          el.trigger($.skyeModal.AJAX_SUCCESS);
          var current = getCurrent();
          current.$elm.empty().append(html).on($.skyeModal.CLOSE, remove);
          current.hideSpinner();
          current.open();
          el.trigger($.skyeModal.AJAX_COMPLETE);
        }).fail(function() {
          el.trigger($.skyeModal.AJAX_FAIL);
          var current = getCurrent();
          current.hideSpinner();
          skyeModals.pop(); // remove expected modal from the list
          el.trigger($.skyeModal.AJAX_COMPLETE);
        });
      }
    } else {
      this.$elm = el;
      this.anchor = el;
      this.$body.append(this.$elm);
      this.open();
    }
  };

  $.skyeModal.prototype = {
    constructor: $.skyeModal,

    open: function() {
      var m = this;
      this.block();
      this.anchor.blur();
      if(this.options.doFade) {
        setTimeout(function() {
          m.show();
        }, this.options.fadeDuration * this.options.fadeDelay);
      } else {
        this.show();
      }
      $(document).off('keydown.skyeModal').on('keydown.skyeModal', function(event) {
        var current = getCurrent();
        if (event.which === 27 && current.options.escapeClose) current.close();
      });
      if (this.options.clickClose)
        this.$blocker.click(function(e) {
          if (e.target === this)
            $.skyeModal.close();
        });
    },

    close: function() {
      skyeModals.pop();
      this.unblock();
      this.hide();
      if (!$.skyeModal.isActive())
        $(document).off('keydown.skyeModal');
    },

    block: function() {
      this.$elm.trigger($.skyeModal.BEFORE_BLOCK, [this._ctx()]);
      this.$body.css('overflow','hidden');
      this.$blocker = $('<div class="' + this.options.blockerClass + ' blocker current"></div>').appendTo(this.$body);
      selectCurrent();
      if(this.options.doFade) {
        this.$blocker.css('opacity',0).animate({opacity: 1}, this.options.fadeDuration);
      }
      this.$elm.trigger($.skyeModal.BLOCK, [this._ctx()]);
    },

    unblock: function(now) {
      if (!now && this.options.doFade)
        this.$blocker.fadeOut(this.options.fadeDuration, this.unblock.bind(this,true));
      else {
        this.$blocker.children().appendTo(this.$body);
        this.$blocker.remove();
        this.$blocker = null;
        selectCurrent();
        if (!$.skyeModal.isActive())
          this.$body.css('overflow','');
      }
    },

    show: function() {
      this.$elm.trigger($.skyeModal.BEFORE_OPEN, [this._ctx()]);
      if (this.options.showClose) {
        this.closeButton = $('<a href="#close-skyeModal" rel="skyeModal:close" class="close-skyeModal ' + this.options.closeClass + '">' + this.options.closeText + '</a>');
        this.$elm.append(this.closeButton);
      }
      this.$elm.addClass(this.options.modalClass).appendTo(this.$blocker);
      if(this.options.doFade) {
        this.$elm.css({opacity: 0, display: 'inline-block'}).animate({opacity: 1}, this.options.fadeDuration);
      } else {
        this.$elm.css('display', 'inline-block');
      }
      this.$elm.trigger($.skyeModal.OPEN, [this._ctx()]);
    },

    hide: function() {
      this.$elm.trigger($.skyeModal.BEFORE_CLOSE, [this._ctx()]);
      if (this.closeButton) this.closeButton.remove();
      var _this = this;
      if(this.options.doFade) {
        this.$elm.fadeOut(this.options.fadeDuration, function () {
          _this.$elm.trigger($.skyeModal.AFTER_CLOSE, [_this._ctx()]);
        });
      } else {
        this.$elm.hide(0, function () {
          _this.$elm.trigger($.skyeModal.AFTER_CLOSE, [_this._ctx()]);
        });
      }
      this.$elm.trigger($.skyeModal.CLOSE, [this._ctx()]);
    },

    showSpinner: function() {
      if (!this.options.showSpinner) return;
      this.spinner = this.spinner || $('<div class="' + this.options.modalClass + '-spinner"></div>')
        .append(this.options.spinnerHtml);
      this.$body.append(this.spinner);
      this.spinner.show();
    },

    hideSpinner: function() {
      if (this.spinner) this.spinner.remove();
    },

    //Return context for custom events
    _ctx: function() {
      return { elm: this.$elm, $elm: this.$elm, $blocker: this.$blocker, options: this.options, $anchor: this.anchor };
    }
  };

  $.skyeModal.close = function(event) {
    if (!$.skyeModal.isActive()) return;
    if (event) event.preventDefault();
    var current = getCurrent();
    current.close();
    return current.$elm;
  };

  // Returns if there currently is an active modal
  $.skyeModal.isActive = function () {
    return skyeModals.length > 0;
  };

  $.skyeModal.getCurrent = getCurrent;

  $.skyeModal.defaults = {
    closeExisting: true,
    escapeClose: true,
    clickClose: true,
    closeText: 'Close',
    closeClass: '',
    modalClass: "skyeModal",
    blockerClass: "jquery-modal",
    spinnerHtml: '<div class="rect1"></div><div class="rect2"></div><div class="rect3"></div><div class="rect4"></div>',
    showSpinner: true,
    showClose: true,
    fadeDuration: null,   // Number of milliseconds the fade animation takes.
    fadeDelay: 1.0        // Point during the overlay's fade-in that the modal begins to fade in (.5 = 50%, 1.5 = 150%, etc.)
  };

  // Event constants
  $.skyeModal.BEFORE_BLOCK = 'skyeModal:before-block';
  $.skyeModal.BLOCK = 'skyeModal:block';
  $.skyeModal.BEFORE_OPEN = 'skyeModal:before-open';
  $.skyeModal.OPEN = 'skyeModal:open';
  $.skyeModal.BEFORE_CLOSE = 'skyeModal:before-close';
  $.skyeModal.CLOSE = 'skyeModal:close';
  $.skyeModal.AFTER_CLOSE = 'skyeModal:after-close';
  $.skyeModal.AJAX_SEND = 'skyeModal:ajax:send';
  $.skyeModal.AJAX_SUCCESS = 'skyeModal:ajax:success';
  $.skyeModal.AJAX_FAIL = 'skyeModal:ajax:fail';
  $.skyeModal.AJAX_COMPLETE = 'skyeModal:ajax:complete';

  $.fn.skyeModal = function(options){
    if (this.length === 1) {
      new $.skyeModal(this, options);
    }
    return this;
  };

  // Automatically bind links with rel="modal:close" to, well, close the modal.
  $(document).on('click.skyeModal', 'a[rel~="skyeModal:close"]', $.skyeModal.close);
  $(document).on('click.skyeModal', 'a[rel~="skyeModal:open"]', function(event) {
    event.preventDefault();
    $(this).skyeModal();
  });
}));
