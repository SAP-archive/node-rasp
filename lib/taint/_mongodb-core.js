'use strict';
(() => {
  // Generic function instrumentation
  function instrumentFunction(obj, func, parameterIndexes) {
    const original = obj[func];
    obj[func] = function() {
      parameterIndexes.forEach((i) => {
        if (arguments[i].query)
          arguments[i].query = sanitizeMongoDBParameter(arguments[i].query);
      });

      return original.apply(this, arguments);
    };
  }

  // Query selector parameter sanitizing
  function sanitizeMongoDBParameter(param) {
    if (param !== undefined && typeof param === 'object') {
      const keys = Object.getOwnPropertyNames(param);
      for (var key of keys) {
        param[key] = sanitizeMongoDBParameter(param[key]);
        if (key[0] === '$' && key.isTainted()) {
          // When a key is tainted we assume that an attacker
          // is on control of the entire object. Therefore,
          // we strip the object and return the value.
          param = param[key];
          break;
        }
      }
    }
    return param;
  }

  module.exports.instrument = (mod) => {
    instrumentFunction(mod.Server.prototype, 'cursor', [1]);
  };

})();
