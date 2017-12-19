/*eslint-disable */
require('../common');
const assert = require('assert');

const str1 = 'var x = "foo";'.setTaint('baz');
const str2 = 'var y = {"foo": "bar"}'.setTaint('baz');
const str3 =
  'var z = {"foo": "b' + 'a'.setTaint('baz') + 'r"}';

(() => {
  eval(str1);
  assert.strictEqual(x.isTainted(), true);
  assert.taintEqual(x, [{'begin': 0, 'end': 3}]);

  eval(str2);
  assert.strictEqual(y.foo.isTainted(), true);
  assert.taintEqual(y.foo, [{'begin': 0, 'end': 3}]);

  eval(str3);
  assert.strictEqual(z.foo.isTainted(), true);
  assert.taintEqual(z.foo, [{'begin': 1, 'end': 2}]);
})();
/*eslint-enable */
