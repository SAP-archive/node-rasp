'use strict';
require('../common');
const assert = require('assert');

const array1 = ['foo'.setTaint('bar')];
const array2 = [42, 'foo'.setTaint('bar')];
const array3 = ['foo'.setTaint('bar'), 'baz'.setTaint('foo')];
const array4 = ['foo'.setTaint('bar'), 'some', 'baz'.setTaint('foo')];
const array5 = ['f' + 'o'.setTaint('bar') + 'a', 'some'];

(() => {
  let string;

  string = array1.join('"');
  assert.strictEqual(string.isTainted(), true);
  assert.taintEqual(string, [{'begin': 0, 'end': 3}]);
  string = array1.join('"'.setTaint('x'));
  assert.strictEqual(string.isTainted(), true);
  assert.taintEqual(string, [{'begin': 0, 'end': 3}]);

  string = array2.join('&');
  assert.strictEqual(string.isTainted(), true);
  assert.taintEqual(string, [{'begin': 3, 'end': 6}]);
  string = array2.join('&'.setTaint('x'));
  assert.strictEqual(string.isTainted(), true);
  assert.taintEqual(string, [
    {'begin': 2, 'end': 3},
    {'begin': 3, 'end': 6}
  ]);

  string = array3.join('test');
  assert.strictEqual(string.isTainted(), true);
  assert.taintEqual(string, [
    {'begin': 0, 'end': 3},
    {'begin': 7, 'end': 10}
  ]);

  string = array4.join('test'.setTaint('y'));
  assert.strictEqual(string.isTainted(), true);
  assert.taintEqual(string, [
    {'begin': 0, 'end': 3},
    {'begin': 3, 'end': 7},
    {'begin': 11, 'end': 15},
    {'begin': 15, 'end': 18}
  ]);

  string = array5.join('%'.setTaint('y'));
  assert.strictEqual(string.isTainted(), true);
  assert.taintEqual(string, [
    {'begin': 1, 'end': 2},
    {'begin': 3, 'end': 4}
  ]);

})();
