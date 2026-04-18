/**
 * GLOBAL JAVASCRIPT
 * Essential functions that need to load before theme.js
 */

// Set up global theme namespace
window.theme = window.theme || {};
window.theme.strings = window.theme.strings || {};
window.theme.settings = window.theme.settings || {};

// Feature detection
(function() {
  'use strict';

  // Check for JavaScript support
  document.documentElement.className = document.documentElement.className.replace('no-js', 'js');

  // Add theme class for styling
  document.documentElement.classList.add('sproutly-theme');

  // Detect touch devices
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    document.documentElement.classList.add('touch-device');
  }

  // Check for reduced motion preference
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.classList.add('prefers-reduced-motion');
  }

  // Polyfill for older browsers
  if (!Element.prototype.closest) {
    Element.prototype.closest = function(selector) {
      var element = this;
      while (element && element.nodeType === 1) {
        if (element.matches(selector)) {
          return element;
        }
        element = element.parentNode;
      }
      return null;
    };
  }

  if (!Element.prototype.matches) {
    Element.prototype.matches = 
      Element.prototype.matchesSelector || 
      Element.prototype.mozMatchesSelector ||
      Element.prototype.msMatchesSelector || 
      Element.prototype.oMatchesSelector || 
      Element.prototype.webkitMatchesSelector ||
      function(s) {
        var matches = (this.document || this.ownerDocument).querySelectorAll(s);
        var i = matches.length;
        while (--i >= 0 && matches.item(i) !== this) {}
        return i > -1;            
      };
  }

})();