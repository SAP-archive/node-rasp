'use strict';
require('../common');
const { URL } = require('url');
const check = require('../../lib/_pathTraversalCheck');
const assert = require('assert');

assert.strictEqual(check.removePathTraversal('../../img.png'), '../../img.png');

const test1 = '../'.taint('bar');
assert.strictEqual(check.removePathTraversal(test1), '');

const test2 = Buffer.from(test1);
assert.deepStrictEqual(check.removePathTraversal(test2), Buffer.from(''));

const test3 = '..'.taint('bar');
assert.strictEqual(check.removePathTraversal(test3), '..');

const test4 = Buffer.from('..'.taint('bar'));
assert.deepStrictEqual(check.removePathTraversal(test4), Buffer.from('..'));

const test5 = '..'.taint('bar') + '/';
assert.strictEqual(check.removePathTraversal(test5), '');

const test6 = Buffer.from(test5);
assert.deepStrictEqual(check.removePathTraversal(test6), Buffer.from(''));

const test7 = '.' + './'.taint('bar');
assert.strictEqual(check.removePathTraversal(test7), '../');

const test8 = Buffer.from(test7);
assert.deepStrictEqual(check.removePathTraversal(test8), Buffer.from('../'));

const test9 = 'test' + '../'.taint('bar');
assert.strictEqual(check.removePathTraversal(test9), 'test');

const test10 = Buffer.from(test9);
assert.deepStrictEqual(check.removePathTraversal(test10), Buffer.from('test'));

const test11 = 'test../'.taint('bar');
assert.strictEqual(check.removePathTraversal(test11), 'test');

const test12 = Buffer.from(test11);
assert.deepStrictEqual(check.removePathTraversal(test12), Buffer.from('test'));

const test13 = '../'.taint('bar') + 'test';
assert.strictEqual(check.removePathTraversal(test13), 'test');

const test14 = Buffer.from(test13);
assert.deepStrictEqual(check.removePathTraversal(test14), Buffer.from('test'));

const test15 = '../test'.taint('bar');
assert.strictEqual(check.removePathTraversal(test15), 'test');

const test16 = Buffer.from(test15);
assert.deepStrictEqual(check.removePathTraversal(test16), Buffer.from('test'));

const test17 = 'test' + '../'.taint('bar') + 'test';
assert.strictEqual(check.removePathTraversal(test17), 'testtest');

const test18 = Buffer.from(test17);
assert.deepStrictEqual(check.removePathTraversal(test18),
                       Buffer.from('testtest'));

const test19 = '../'.taint('bar') + 'test' + '../'.taint('foo');
assert.strictEqual(check.removePathTraversal(test19), 'test');

const test20 = Buffer.from(test19);
assert.deepStrictEqual(check.removePathTraversal(test20), Buffer.from('test'));

const test21 = '../t'.taint('bar') + 'es' + 't../'.taint('foo');
assert.strictEqual(check.removePathTraversal(test21), 'test');

const test22 = Buffer.from(test21);
assert.deepStrictEqual(check.removePathTraversal(test22), Buffer.from('test'));

const test23 = 'tes' + 't../t'.taint('bar') + 'est';
assert.strictEqual(check.removePathTraversal(test23), 'testtest');

const test24 = Buffer.from(test23);
assert.deepStrictEqual(check.removePathTraversal(test24),
                       Buffer.from('testtest'));

const test25 = 'test' + '..'.taint('bar') + '/test';
assert.strictEqual(check.removePathTraversal(test25), 'testtest');

const test26 = Buffer.from(test25);
assert.deepStrictEqual(check.removePathTraversal(test26),
                       Buffer.from('testtest'));

const test27 = 'test' + '....'.taint('bar') + '/test';
assert.strictEqual(check.removePathTraversal(test27), 'test..test');

const test28 = Buffer.from(test27);
assert.deepStrictEqual(check.removePathTraversal(test28),
                       Buffer.from('test..test'));

const test29 = 'test' + '......'.taint('bar') + '/test';
assert.strictEqual(check.removePathTraversal(test29), 'test....test');

const test30 = Buffer.from(test29);
assert.deepStrictEqual(check.removePathTraversal(test30),
                       Buffer.from('test....test'));

const test31 = '..'.taint('bar') + 'test..' +
               '......'.taint('bar') + '/test';
assert.strictEqual(check.removePathTraversal(test31), '..test......test');

const test32 = Buffer.from(test31);
assert.deepStrictEqual(check.removePathTraversal(test32),
                       Buffer.from('..test......test'));

const test33 = '..'.taint('bar') + 'test..' +
               '......'.taint('bar') + '/test' + '..'.taint('bar') + '/';
assert.strictEqual(check.removePathTraversal(test33), '..test......test');

const test34 = Buffer.from(test33);
assert.deepStrictEqual(check.removePathTraversal(test34),
                       Buffer.from('..test......test'));

const test35 = '....'.taint('bar') + '/test' + '....'.taint('bar') +
               '/test' + '..'.taint('bar') + 'test';
assert.strictEqual(check.removePathTraversal(test35), '..test..test..test');

const test36 = Buffer.from(test35);
assert.deepStrictEqual(check.removePathTraversal(test36),
                       Buffer.from('..test..test..test'));

const test37 = '....'.taint('bar') + '/test' + '....'.taint('bar') +
               '/test' + '..'.taint('bar') + 'test' + '..'.taint('bar');
assert.strictEqual(check.removePathTraversal(test37), '..test..test..test..');

const test38 = Buffer.from(test37);
assert.deepStrictEqual(check.removePathTraversal(test38),
                       Buffer.from('..test..test..test..'));

const test41 = '...'.taint('bar') + '/test' + '...'.taint('bar');
assert.strictEqual(check.removePathTraversal(test41), '.test...');

const test42 = Buffer.from(test41);
assert.deepStrictEqual(check.removePathTraversal(test42),
                       Buffer.from('.test...'));

//checks for path traversal on URL not implented
const test39 = new URL('file:///../tmp/hello'.taint('bar'));
assert.deepStrictEqual(check.removePathTraversal(test39), new URL('file:///../tmp/hello'));

const test40 = new URL('file:///../tmp/hello');
assert.deepStrictEqual(check.removePathTraversal(test40), new URL('file:///../tmp/hello'));
