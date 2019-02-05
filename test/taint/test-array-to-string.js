'use strict';
require('../common');
const assert = require('assert');

const array1 = ['foo'.taint('bar')];
const array2 = [42, 'foo'.taint('bar')];
const array3 = ['foo'.taint('bar'), 'baz'.taint('foo')];
const array4 = ['foo'.taint('bar'), 'some', 'baz'.taint('foo')];
const array5 = ['f' + 'o'.taint('bar') + 'a', 'some'];

(() => {
  let string;

  string = array1.toString();
  assert.strictEqual(string.isTainted(), true);
  assert.taintEqual(string, [{ 'begin': 0, 'end': 3 }]);

  string = array2.toString();
  assert.strictEqual(string.isTainted(), true);
  assert.taintEqual(string, [{ 'begin': 3, 'end': 6 }]);

  string = array3.toString();
  assert.strictEqual(string.isTainted(), true);
  assert.taintEqual(string, [
    { 'begin': 0, 'end': 3 },
    { 'begin': 4, 'end': 7 }
  ]);

  string = array4.toString();
  assert.strictEqual(string.isTainted(), true);
  assert.taintEqual(string, [
    { 'begin': 0, 'end': 3 },
    { 'begin': 9, 'end': 12 }
  ]);

  string = array5.toString();
  assert.strictEqual(string.isTainted(), true);
  assert.taintEqual(string, [{ 'begin': 1, 'end': 2 }]);

})();
