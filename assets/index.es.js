/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
var __assign = function() {
  __assign = Object.assign || function __assign2(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];
      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
    }
    return t;
  };
  return __assign.apply(this, arguments);
};
var defaultOptions = {
  once: false,
  threshold: 0
};
var buildOptions = function(options) {
  return __assign(__assign({}, defaultOptions), options);
};
var observe = function(target, observer) {
  var targets = target instanceof Element ? [target] : target;
  for (var i = 0; i < targets.length; i++) {
    observer.observe(targets[i]);
  }
};
var createObserver = function(callback, options, condition) {
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      var target = entry.target;
      if (entry.rootBounds !== null && condition(entry)) {
        callback(target, {
          isAboveView: entry.boundingClientRect.bottom < entry.rootBounds.height / 2 && entry.boundingClientRect.top < 0,
          isInView: entry.isIntersecting,
          isBelowView: entry.boundingClientRect.top > entry.rootBounds.height / 2 && entry.boundingClientRect.bottom > entry.rootBounds.height
        });
        if (options.once) {
          observer.unobserve(target);
        }
      }
    });
  }, {
    threshold: options.threshold
  });
  return observer;
};
var isInView = function(target, callback, options) {
  if (options === void 0) {
    options = {};
  }
  var completeOptions = buildOptions(options);
  var observer = createObserver(callback, completeOptions, function(entry) {
    return entry.isIntersecting;
  });
  observe(target, observer);
};
var isOutOfView = function(target, callback, options) {
  if (options === void 0) {
    options = {};
  }
  var completeOptions = buildOptions(options);
  var observer = createObserver(callback, completeOptions, function(entry) {
    return !entry.isIntersecting;
  });
  observe(target, observer);
};
export {
  isOutOfView as a,
  isInView as i
};
