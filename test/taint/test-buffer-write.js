'use strict';
require('../common');
const assert = require('assert');

// ASCII
const strAsciiTaint = 'This is a tainted string!'.setTaint('baz');
const strAsciiTaintLen = strAsciiTaint.length;
const bufAsciiTaintLen = Buffer.from(strAsciiTaint).length;

// UTF8
const strUtf8 = '😃㻖';
const strUtf8Taint = strUtf8.setTaint('abc');
const strUtf8TaintLen = Buffer.from(strUtf8Taint, 'utf8')
                                               .toString('utf8').length;
const bufUtf8TaintLen = Buffer.from(strUtf8Taint, 'utf8').length;

let resultString;

// Without Encoding
const buf01 = new Buffer(bufAsciiTaintLen);
buf01.write(strAsciiTaint, 'ascii');
assert.taintEqual(buf01, [{ 'begin': 0, 'end': bufAsciiTaintLen }]);
resultString = buf01.toString();
assert.strictEqual(resultString.isTainted(), true);
assert.taintEqual(resultString, [{ 'begin': 0, 'end': strAsciiTaintLen }]);

// Ascii Encoding
const buf02 = new Buffer(bufAsciiTaintLen);
buf02.write(strAsciiTaint, 'ascii');
assert.taintEqual(buf02, [{ 'begin': 0, 'end': bufAsciiTaintLen }]);
resultString = buf02.toString('ascii');
assert.strictEqual(resultString.isTainted(), true);
assert.taintEqual(resultString, [{ 'begin': 0, 'end': strAsciiTaintLen }]);

// Without utf8 encoding
const buf03 = new Buffer(bufUtf8TaintLen);
buf03.write(strUtf8Taint);
assert.taintEqual(buf03, [{ 'begin': 0, 'end': bufUtf8TaintLen }]);
resultString = buf03.toString();
assert.strictEqual(resultString.isTainted(), true);
assert.taintEqual(resultString, [{ 'begin': 0, 'end': strUtf8TaintLen }]);

// Without utf8 encoding
const buf04 = new Buffer(bufUtf8TaintLen);
buf04.write(strUtf8Taint, 'utf8');
assert.taintEqual(buf04, [{ 'begin': 0, 'end': bufUtf8TaintLen }]);
resultString = buf04.toString('utf8');
assert.strictEqual(resultString.isTainted(), true);
assert.taintEqual(resultString, [{ 'begin': 0, 'end': strUtf8TaintLen }]);
