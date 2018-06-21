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

  string = array1.join('"');
  assert.strictEqual(string.isTainted(), true);
  assert.taintEqual(string, [{ 'begin': 0, 'end': 3 }]);
  string = array1.join('"'.taint('x'));
  assert.strictEqual(string.isTainted(), true);
  assert.taintEqual(string, [{ 'begin': 0, 'end': 3 }]);

  string = array2.join('&');
  assert.strictEqual(string.isTainted(), true);
  assert.taintEqual(string, [{ 'begin': 3, 'end': 6 }]);
  string = array2.join('&'.taint('x'));
  assert.strictEqual(string.isTainted(), true);
  assert.taintEqual(string, [
    { 'begin': 2, 'end': 3 },
    { 'begin': 3, 'end': 6 }
  ]);

  string = array3.join('test');
  assert.strictEqual(string.isTainted(), true);
  assert.taintEqual(string, [
    { 'begin': 0, 'end': 3 },
    { 'begin': 7, 'end': 10 }
  ]);

  string = array4.join('test'.taint('y'));
  assert.strictEqual(string.isTainted(), true);
  assert.taintEqual(string, [
    { 'begin': 0, 'end': 3 },
    { 'begin': 3, 'end': 7 },
    { 'begin': 11, 'end': 15 },
    { 'begin': 15, 'end': 18 }
  ]);

  string = array5.join('%'.taint('y'));
  assert.strictEqual(string.isTainted(), true);
  assert.taintEqual(string, [
    { 'begin': 1, 'end': 2 },
    { 'begin': 3, 'end': 4 }
  ]);

})();
