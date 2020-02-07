(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined'
      ? module.exports = factory() :
      typeof define === 'function' && define.amd ? define(factory) :
          (global.toaster = factory());
}(this, (function () {
  'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) {
        descriptor.writable = true;
      }
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) {
      _defineProperties(Constructor.prototype, protoProps);
    }
    if (staticProps) {
      _defineProperties(Constructor, staticProps);
    }
    return Constructor;
  }

  /**
   * Toaster
   */

  /**
   * Private Variables
   */
  var toasterClass = "".concat(vl.ns, "toaster"),
      alertClass = "".concat(vl.ns, "alert"),
      toasterFadeClass = "".concat(alertClass, "--fade-out"),
      alertCloseClass = "".concat(alertClass, "__close"),
      dataPrefix = "data-".concat(vl.ns),
      toasterAtt = "".concat(dataPrefix, "toaster"),
      toasterDressedAtt = "".concat(toasterAtt, "-dressed"),
      toasterFadeoutAtt = "".concat(toasterAtt, "-fadeout");
  /**
   * Private Functions
   */

  var _addAlert = function _addAlert(alert) {
    vl.util.addClass(alert, toasterFadeClass);
    window.setTimeout(function () {
      vl.util.removeClass(alert, toasterFadeClass);
    }, 300);
  };

  var _removeAlert = function _removeAlert(alert) {
    vl.util.addClass(alert, toasterFadeClass);
    window.setTimeout(function () {
      alert.remove();
    }, 300);
  };

  var _bindCloseButtons = function _bindCloseButtons(actions) {
    vl.util.each(actions, function (action) {
      action.addEventListener('click', function (e) {
        _removeAlert(e.currentTarget.parentElement);
      });
    });
  };

  var _observeToaster = function _observeToaster(event) {
    var toaster = event[0].target,
        firstAlert = toaster.firstElementChild,
        newAlert = toaster.lastElementChild; // detect if alert is added
    if (event[0].addedNodes.length > 0) {
      _addAlert(newAlert);

      _bindCloseButtons(
          newAlert.shadowRoot ?
                newAlert.shadowRoot.querySelectorAll(".".concat(alertCloseClass))
              : newAlert.querySelectorAll(".".concat(alertCloseClass)));
      if (toaster.getAttribute(toasterFadeoutAtt) === 'true') {
        window.setTimeout(function () {
          _removeAlert(newAlert);
        }, 5000);
      }
    } // when five or more alerts are visible

    if (toaster.childElementCount > 5) {
      _removeAlert(firstAlert);
    }
  };

  var Toaster =
      /*#__PURE__*/
      function () {
        function Toaster() {
          _classCallCheck(this, Toaster);
        }

        _createClass(Toaster, [{
          key: "dress",
          value: function dress(toaster) {
            toaster.setAttribute(toasterDressedAtt, true);
            var observer = new window.MutationObserver(_observeToaster),
                actions = toaster.shadowRoot ?
                      toaster.shadowRoot.querySelectorAll(".".concat(alertCloseClass))
                    : toaster.querySelectorAll(".".concat(alertCloseClass));

            observer.observe(toaster, {
              attributes: true,
              childList: true
            });

            _bindCloseButtons(actions);
          }
        }, {
          key: "dressAll",
          value: function dressAll() {
            var _this = this;

            var elements = document.querySelectorAll(
                ".".concat(toasterClass, ":not([").concat(toasterDressedAtt,
                    "]):not([data-").concat(vl.ns,
                    "js-dress=\"false\"]),\n      [").concat(toasterAtt,
                    "]:not([").concat(toasterDressedAtt,
                    "]):not([data-").concat(vl.ns, "js-dress=\"false\"])"));
            vl.util.each(elements, function (element) {
              _this.dress(element);
            });
          }
        }]);

        return Toaster;
      }();

  if (!('toaster' in vl)) {
    vl.toaster = new Toaster();
    vl.toaster.dressAll();
  }

  return Toaster;

})));
