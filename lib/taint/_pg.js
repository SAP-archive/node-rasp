'use strict';
const log = require('taint/logger');
const { removeAllInjections, hasInjection } = require('taint/pg_lexer');

function instrumentFunction(obj, func) {
  const original = obj[func];
  obj[func] = function() {
    if (typeof arguments[0] === 'string' && hasInjection(arguments[0]) ||
        typeof arguments[0] === 'object' && hasInjection(arguments[0].text)) {
      var args = sanatizeArgs(Array.prototype.slice.call(arguments));
      log.detected('PostgreSQL Injection');
    }
    return original.apply(this, args || arguments);
  };
}

function sanatizeArgs(args) {
  if (typeof args[0] === 'string') {
    const { query } = removeAllInjections(args[0]);
    args[0] = query;
  } else if (typeof args[0] === 'object') {
    const { query } = removeAllInjections(args[0].text);
    args[0].text = query;
  }
  return args;
}

module.exports.instrument = (mod) => {
  instrumentFunction(mod.Client.prototype, 'query');
};
