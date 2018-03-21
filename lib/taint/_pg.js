'use strict';
(() => {
  const log = require('taint/logger');
  const lexer = require('taint/pg_lexer');

  function instrumentFunction(obj, func) {
    const original = obj[func];
    obj[func] = function() {
      if (typeof arguments[0] === 'object' && arguments[0]['text']) {
        if (lexer.checkInjection(arguments[0]['text']))
          log.detected('PostgreSQL Injection', 'not available');

      } else if (typeof arguments[0] === 'string') {
        if (lexer.checkInjection(arguments[0]))
          log.detected('PostgreSQL Injection', 'not available');
      }
      return original.apply(this, arguments);
    };
  }

  module.exports.instrument = (mod) => {
    instrumentFunction(mod.Client.prototype, 'query');
  };

})();
