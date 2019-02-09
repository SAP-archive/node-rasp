'use strict';
require('../common');
const assert = require('assert');

const _mongodb_core = require('../../lib/taint/_mongodb-core.js');

(() => {
  function operation() {
    return Array.prototype.slice.call(arguments);
  }

  const mod = {
    'Server': {
      'prototype': {
        'cursor': operation,
        'update': operation,
        'remove': operation,
        'command': operation
      }
    }
  };

  _mongodb_core.instrument(mod);
  const remove = mod.Server.prototype.remove;

  // Server.prototype.remove
  const param0 = {};
  assert.deepStrictEqual(remove('', { 'q': param0 }), ['', { 'q': {} }]);

  const param1 = {};
  param1.foo = '123';
  assert.deepStrictEqual(remove('', { 'q': param1 }),
                         ['', { 'q': { 'foo': '123' } }]);

  const param2 = {};
  param2['foo'.taint('bar')] = '123';
  assert.deepStrictEqual(remove('', { 'q': param2 }),
                         ['', { 'q': { 'foo': '123' } }]);

  const selector1 = {};
  selector1.$ne = '123';
  const param3 = {};
  param3.bar = selector1;
  assert.deepStrictEqual(remove('', { 'q': param3 }),
                         ['', { 'q': { 'bar': { '$ne': '123' } } }]);

  const selector2 = {};
  selector2['$ne'.taint('bar')] = '123';
  const param4 = {};
  param4.bar = selector2;
  assert.deepStrictEqual(remove('', { 'q': param4 }),
                         ['', { 'q': { 'bar': '123' } }]);

  const selector3 = {};
  selector3['$gt'.taint('bar')] = '123';
  const param5 = {};
  param5['foo'.taint('bar')] = '123';
  param5.bar = selector3;
  assert.deepStrictEqual(remove('', { 'q': param5 }),
                         ['', { 'q': { 'foo': '123', 'bar': '123' } }]);

  const selector4 = {};
  selector4['$gt'.taint('bar')] = '123';
  const param6 = {};
  param6['foo'.taint('bar')] = '123';
  param6.bar = selector4;
  assert.deepStrictEqual(remove('', { 'q': param6 }),
                         ['', { 'q': { 'foo': '123', 'bar': '123' } }]);

  // Selector without property
  const selector5 = {};
  selector5['$lt'.taint('bar')] = '123';
  assert.deepStrictEqual(remove('', { 'q': selector5 }),
                         ['', { 'q': '123' }]);

})();
