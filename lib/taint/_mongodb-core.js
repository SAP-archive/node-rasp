'use strict';
(() => {
  // Generic function instrumentation
  function instrumentFunction(obj, func, parameterIndexes, property) {
    const original = obj[func];
    obj[func] = function() {
      parameterIndexes.forEach((i) => {
        // Check for array or object
        if (Array.isArray(arguments[i])) {
          for (var j = 0; j < arguments[i].length; j++) {
            if (arguments[i][j][property]) {
              arguments[i][j][property] =
                sanitizeQuerySelectors(arguments[i][j][property]);
            }
          }
        } else if (typeof arguments[i] === 'object' && arguments[i][property]) {
          arguments[i][property] =
            sanitizeQuerySelectors(arguments[i][property]);
        }
      });
      return original.apply(this, arguments);
    };
  }

  // Query selector parameter sanitizing
  function sanitizeQuerySelectors(param) {
    if (param !== undefined && typeof param === 'object') {
      const keys = Object.getOwnPropertyNames(param);
      for (var key of keys) {
        param[key] = sanitizeQuerySelectors(param[key]);
        if (key[0] === '$' && key.isTainted()) {
          // When a key is tainted we assume that an attacker
          // is on control of the entire object. Therefore,
          // we strip the object and return the value.
          param = param[key];
          console.info(
            '\x1b[31m', '[',
            '\x1b[36m', 'TaintNode',
            '\x1b[31m', ']',
            '\x1b[90m', `query selector injection with ${key} detected`);
          break;
        }
      }
    }
    return param;
  }

  module.exports.instrument = (mod) => {
    instrumentFunction(mod.Server.prototype, 'cursor', [1], 'query');
    instrumentFunction(mod.Server.prototype, 'update', [1], 'q');
    instrumentFunction(mod.Server.prototype, 'remove', [1], 'q');
    instrumentFunction(mod.Server.prototype, 'command', [1], 'query');
  };

})();
