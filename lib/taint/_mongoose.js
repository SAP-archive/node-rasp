'use strict';
(() => {
  // Generic function instrumentation
  function instrumentFunction(obj, func, parameterIndexes) {
    const original = obj[func];
    obj[func] = function() {
      parameterIndexes.forEach((i) => {
        arguments[i] = sanitizeMongoDBParameter(arguments[i]);
      });

      return original.apply(this, arguments);
    };
  }

  // MongoDB parameter sanitizing
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
    // Model
    instrumentFunction(mod.Model, 'find', [0]);
    instrumentFunction(mod.Model, 'findOne', [0]);
    instrumentFunction(mod.Model, 'findOneAndUpdate', [0]);
    instrumentFunction(mod.Model, 'findOneAndRemove', [0]);
    instrumentFunction(mod.Model, 'count', [0]);
    instrumentFunction(mod.Model, 'where', [0]);
    instrumentFunction(mod.Model, 'update', [0]);
    instrumentFunction(mod.Model, 'updateMany', [0]);
    instrumentFunction(mod.Model, 'updateOne', [0]);
    instrumentFunction(mod.Model, 'deleteOne', [0]);
    instrumentFunction(mod.Model, 'deleteMany', [0]);
    instrumentFunction(mod.Model, 'remove', [0]);
    instrumentFunction(mod.Model, 'replaceOne', [0]);
    //instrumentFunction(mod.Model.distinct, [1]);
    //instrumentFunction(mod.Model.bulkWrite, [1]);

    // Query
    instrumentFunction(mod.Query.base, 'findOne', [0]);
    instrumentFunction(mod.Query.base, 'findOneAndUpdate', [0]);
    instrumentFunction(mod.Query.base, 'findOneAndRemove', [0]);
    instrumentFunction(mod.Query.base, 'replaceOne', [0]);
    instrumentFunction(mod.Query.base, 'update', [0]);
    instrumentFunction(mod.Query.base, 'updateMany', [0]);
    instrumentFunction(mod.Query.base, 'updateOne', [0]);
    //instrumentFunction(mod.Query.base, '$where', [0]);
  };

})();
