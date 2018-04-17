'use strict';
require('../common');
const assert = require('assert');

const array1 = ['i\u0307'.setTaint('bar')];
const array2 = [42, 'foo'.setTaint('bar')];
const array3 = ['foo'.setTaint('bar'), 'baz'.setTaint('foo')];
const array4 = ['foo'.setTaint('bar'), 'some', 'baz'.setTaint('foo')];
const array5 = ['f' + 'o'.setTaint('bar') + 'a', 'some'];

(() => {
  let string;

  string = array1.toLocaleString('lt-LT');
  assert.strictEqual(string.isTainted(), true);
  assert.taintEqual(string, [{ 'begin': 0, 'end': 2 }]);

  string = array2.toLocaleString();
  assert.strictEqual(string.isTainted(), true);
  assert.taintEqual(string, [{ 'begin': 3, 'end': 6 }]);

  string = array3.toLocaleString();
  assert.strictEqual(string.isTainted(), true);
  assert.taintEqual(string, [
    { 'begin': 0, 'end': 3 },
    { 'begin': 4, 'end': 7 }
  ]);

  string = array4.toLocaleString();
  assert.strictEqual(string.isTainted(), true);
  assert.taintEqual(string, [
    { 'begin': 0, 'end': 3 },
    { 'begin': 9, 'end': 12 }
  ]);

  string = array5.toLocaleString();
  assert.strictEqual(string.isTainted(), true);
  assert.taintEqual(string, [{ 'begin': 1, 'end': 2 }]);

})();
