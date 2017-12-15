'use strict';
require('../common');
const assert = require('assert');

const _mongoose = require('../../lib/taint/_mongoose.js');

(() => {
  function operation() {
    return Array.prototype.slice.call(arguments);
  }

  const mod = {
    'Model': {
      'find': operation,
      'findOne': operation
    },
    'Query': {
      'base': {
        'findOne': operation
      }
    }
  };

  _mongoose.instrument(mod);

  const param1 = {};
  param1['foo'] = '123';
  assert.deepStrictEqual(mod.Model.find(param1), [{'foo': '123'}]);

  const param2 = {};
  param2['foo'.setTaint('bar')] = '123';
  assert.deepStrictEqual(mod.Model.find(param2), [{'foo': '123'}]);

  const param3 = {};
  param3['$gt'.setTaint('bar')] = '123';
  assert.deepStrictEqual(mod.Model.find(param3), [{'gt': '123'}]);

  const param4 = {};
  param4['foo'.setTaint('bar')] = '123';
  param4['$gt'.setTaint('bar')] = '123';
  assert.deepStrictEqual(mod.Model.find(param4),
    [{'foo': '123', 'gt': '123'}]);

  const param5 = {};
  param5['$ne'.setTaint('bar')] = '123';
  const param6 = {};
  param6['foo'.setTaint('bar')] = '123';
  param6['bar'] = param5;
  assert.deepStrictEqual(mod.Model.find(param6),
    [{'foo': '123', 'bar': {'ne': '123'}}]);
})();
