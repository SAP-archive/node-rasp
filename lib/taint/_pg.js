'use strict';
(() => {
  const log = require('taint/logger');
  const lexer = require('taint/pg_lexer');

  function instrumentFunction(obj, func) {
    const original = obj[func];
    obj[func] = function() {
      if (typeof arguments[0] === 'object' && arguments[0]['text']) {
        const {query, params} = lexer.removeInjection(
          arguments[0]['text'], arguments[0]['values']);
        log.detected('PostgreSQL Injection', 'not available');
        arguments[0]['text'] = query;
        arguments[0]['values'] = params;
      } else if (typeof arguments[0] === 'string' &&
                 typeof arguments[1] === 'object') {
        const {query, params} = lexer.removeInjection(
          arguments[0], arguments[1]);
        //log.detected('PostgreSQL Injection', 'not available');
        arguments[0] = query;
        arguments[1] = params;
      } else if (typeof arguments[0] === 'string') {
        const {query, params} = lexer.removeInjection(
          arguments[0], []);
        //log.detected('PostgreSQL Injection', 'not available');
        arguments[0] = query;
        arguments[1] = params;
      }
      return original.apply(this, arguments);
    };
  }

  module.exports.instrument = (mod) => {
    instrumentFunction(mod.Client.prototype, 'query');
  };

})();
