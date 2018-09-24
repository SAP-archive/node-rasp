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
  const command = mod.Server.prototype.command;

  // Server.prototype.command
  const param0 = {};
  assert.deepStrictEqual(command('', { 'query': param0 }),
                         ['', { 'query': {} }]);

  const param1 = {};
  param1.foo = '123';
  assert.deepStrictEqual(command('', { 'query': param1 }),
                         ['', { 'query': { 'foo': '123' } }]);

  const param2 = {};
  param2['foo'.setTaint('bar')] = '123';
  assert.deepStrictEqual(command('', { 'query': param2 }),
                         ['', { 'query': { 'foo': '123' } }]);

  const selector1 = {};
  selector1.$ne = '123';
  const param3 = {};
  param3.bar = selector1;
  assert.deepStrictEqual(command('', { 'query': param3 }),
                         ['', { 'query': { 'bar': { '$ne': '123' } } }]);

  const selector2 = {};
  selector2['$ne'.setTaint('bar')] = '123';
  const param4 = {};
  param4.bar = selector2;
  assert.deepStrictEqual(command('', { 'query': param4 }),
                         ['', { 'query': { 'bar': '123' } }]);

  const selector3 = {};
  selector3['$gt'.setTaint('bar')] = '123';
  const param5 = {};
  param5['foo'.setTaint('bar')] = '123';
  param5.bar = selector3;
  assert.deepStrictEqual(command('', { 'query': param5 }),
                         ['', { 'query': { 'foo': '123', 'bar': '123' } }]);

  const selector4 = {};
  selector4['$gt'.setTaint('bar')] = '123';
  const param6 = {};
  param6['foo'.setTaint('bar')] = '123';
  param6.bar = selector4;
  assert.deepStrictEqual(command('', { 'query': param6 }),
                         ['', { 'query': { 'foo': '123', 'bar': '123' } }]);

  // Selector without property
  const selector5 = {};
  selector5['$lt'.setTaint('bar')] = '123';
  assert.deepStrictEqual(command('', { 'query': selector5 }),
                         ['', { 'query': '123' }]);

})();
