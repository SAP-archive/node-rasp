'use strict';
require('../common');
const assert = require('assert');

// UTF8
const strUtf8 = '😃㻖';
const strUtf8Taint = strUtf8.setTaint('abc');

const strUtf8Len = Buffer.from(strUtf8, 'utf8').toString('utf8').length;
const strUtf8TaintLen = Buffer.from(strUtf8Taint, 'utf8')
                                               .toString('utf8').length;

// HEX UNICODE
const strHexUnicode = Buffer.from(strUtf8, 'utf8').toString('hex');
const strHexUnicodeTaint = Buffer.from(strUtf8Taint, 'utf8').toString('hex')
                                                            .setTaint('abc');

const strHexUnicodeLen = Buffer.from(strUtf8, 'utf8').toString('hex').length;
const strHexUnicodeTaintLen = Buffer.from(strUtf8Taint, 'utf8')
                                                     .toString('hex').length;

const bufHexUnicodeLen = Buffer.from(strHexUnicode, 'hex').length;
const bufHexUnicodeTaintLen = Buffer.from(strHexUnicodeTaint, 'hex').length;

let resultString;
let taintEnd;
let taintEnd2;
let taintStart;
let taintStart2;
// let helpString;
// let helpStringEncoded;

// ### ONE STRING ###

// HexUnicode string in buffer is tainted.
const buf01 = new Buffer(strHexUnicodeTaint, 'hex');
assert.taintEqual(buf01, [{ 'begin': 0, 'end': bufHexUnicodeTaintLen }]);
// Test HEX UNICODE
resultString = buf01.toString('hex');
assert.strictEqual(resultString.isTainted(), true);
assert.taintEqual(resultString, [{ 'begin': 0, 'end': strHexUnicodeTaintLen }]);
// Test UTF8
resultString = buf01.toString('utf8');
assert.strictEqual(resultString.isTainted(), true);
assert.taintEqual(resultString, [{ 'begin': 0, 'end': strUtf8TaintLen }]);

// Test 02: HexUnicode string in buffer is not tainted.
const buf02 = new Buffer(strHexUnicode, 'hex');
assert.taintEqual(buf02, []);
// Test HEX UNICODE
resultString = buf02.toString('hex');
assert.strictEqual(resultString.isTainted(), false);
assert.taintEqual(resultString, []);
// Test UTF8
resultString = buf02.toString('utf8');
assert.strictEqual(resultString.isTainted(), false);
assert.taintEqual(resultString, []);


// ### Concatenation of strings ###

// Concatenated hex string: One tainted string
const buf03 = new Buffer(strHexUnicode + strHexUnicodeTaint + strHexUnicode,
                         'hex');
taintStart = bufHexUnicodeLen;
taintEnd = taintStart + bufHexUnicodeTaintLen;
assert.taintEqual(buf03, [{ 'begin': taintStart, 'end': taintEnd }]);
// Test HEX
resultString = buf03.toString('hex');
assert.strictEqual(resultString.isTainted(), true);
taintStart = strHexUnicodeLen;
taintEnd = taintStart + strHexUnicodeTaintLen;
assert.taintEqual(resultString, [{ 'begin': taintStart, 'end': taintEnd }]);
// Test UTF8
resultString = buf03.toString('utf8');
assert.strictEqual(resultString.isTainted(), true);
taintStart = strUtf8Len;
taintEnd = taintStart + strUtf8TaintLen;
assert.taintEqual(resultString, [{ 'begin': taintStart, 'end': taintEnd }]);

// Concatenated hex string: Two same tainted string
const buf04 = new Buffer(strHexUnicode + strHexUnicodeTaint +
                         strHexUnicodeTaint + strHexUnicode, 'hex');
taintStart = bufHexUnicodeLen;
taintEnd = taintStart + bufHexUnicodeTaintLen * 2;
assert.taintEqual(buf04, [{ 'begin': taintStart, 'end': taintEnd }]);
// Test HEX
resultString = buf04.toString('hex');
assert.strictEqual(resultString.isTainted(), true);
taintStart = strHexUnicodeLen;
taintEnd = taintStart + strHexUnicodeTaintLen * 2;
assert.taintEqual(resultString, [{ 'begin': taintStart, 'end': taintEnd }]);
// Test UTF8
resultString = buf04.toString('utf8');
assert.strictEqual(resultString.isTainted(), true);
taintStart = strUtf8Len;
taintEnd = taintStart + strUtf8Len * 2;
assert.taintEqual(resultString, [{ 'begin': taintStart, 'end': taintEnd }]);

// Concatenated hex string: Two different tainted string
const buf05 = new Buffer(strHexUnicode + strHexUnicodeTaint
             .setTaint('different') + strHexUnicodeTaint + strHexUnicode,
                         'hex');
taintStart = bufHexUnicodeLen;
taintEnd = taintStart + bufHexUnicodeTaintLen;
taintStart2 = taintEnd;
taintEnd2 = taintStart2 + bufHexUnicodeTaintLen;
assert.taintEqual(buf05, [{ 'begin': taintStart, 'end': taintEnd },
                          { 'begin': taintStart2, 'end': taintEnd2 }]);
// Test HEX
resultString = buf05.toString('hex');
assert.strictEqual(resultString.isTainted(), true);
taintStart = strHexUnicodeLen;
taintEnd = taintStart + strHexUnicodeTaintLen;
taintStart2 = taintEnd;
taintEnd2 = taintStart2 + strHexUnicodeTaintLen;
assert.taintEqual(resultString, [{ 'begin': taintStart, 'end': taintEnd },
                                 { 'begin': taintStart2, 'end': taintEnd2 }]);
// Test UTF8
resultString = buf05.toString('utf8');
assert.strictEqual(resultString.isTainted(), true);
taintStart = strUtf8Len;
taintEnd = taintStart + strUtf8TaintLen;
taintStart2 = taintEnd;
taintEnd2 = taintStart2 + strUtf8TaintLen;
assert.taintEqual(resultString, [{ 'begin': taintStart, 'end': taintEnd },
                                 { 'begin': taintStart2, 'end': taintEnd2 }]);

// HEX string: Taint at the beginning
const buf06 = new Buffer(strHexUnicodeTaint + strHexUnicode, 'hex');
taintStart = 0;
taintEnd = bufHexUnicodeTaintLen;
assert.taintEqual(buf06, [{ 'begin': taintStart, 'end': taintEnd }]);
// Test HEX
resultString = buf06.toString('hex');
assert.strictEqual(resultString.isTainted(), true);
taintStart = 0;
taintEnd = strHexUnicodeTaintLen;
assert.taintEqual(resultString, [{ 'begin': taintStart, 'end': taintEnd }]);
// Test UTF8
resultString = buf06.toString('utf8');
assert.strictEqual(resultString.isTainted(), true);
taintStart = 0;
taintEnd = strUtf8TaintLen;
assert.taintEqual(resultString, [{ 'begin': taintStart, 'end': taintEnd }]);


// HEX string: Taint at the end
const buf07 = new Buffer(strHexUnicode + strHexUnicodeTaint, 'hex');
taintStart = bufHexUnicodeLen;
taintEnd = taintStart + bufHexUnicodeTaintLen;
assert.taintEqual(buf07, [{ 'begin': taintStart, 'end': taintEnd }]);
// Test HEX
resultString = buf07.toString('hex');
assert.strictEqual(resultString.isTainted(), true);
taintStart = strHexUnicodeLen;
taintEnd = taintStart + strHexUnicodeTaintLen;
assert.taintEqual(resultString, [{ 'begin': taintStart, 'end': taintEnd }]);
// Test UTF8
resultString = buf07.toString('utf8');
assert.strictEqual(resultString.isTainted(), true);
taintStart = strUtf8Len;
taintEnd = taintStart + strUtf8TaintLen;
assert.taintEqual(resultString, [{ 'begin': taintStart, 'end': taintEnd }]);

// Hex String at the beginning and the end
const buf08 = new Buffer(strHexUnicodeTaint + strHexUnicode +
                         strHexUnicodeTaint, 'hex');
taintStart = 0;
taintEnd = bufHexUnicodeTaintLen;
taintStart2 = taintEnd + bufHexUnicodeLen;
taintEnd2 = taintStart2 + bufHexUnicodeTaintLen;
assert.taintEqual(buf08, [{ 'begin': taintStart, 'end': taintEnd },
                          { 'begin': taintStart2, 'end': taintEnd2 }]);

// Test HEX
resultString = buf08.toString('hex');
assert.strictEqual(resultString.isTainted(), true);
taintStart = 0;
taintEnd = strHexUnicodeTaintLen;
taintStart2 = taintEnd + strHexUnicodeLen;
taintEnd2 = taintStart2 + strHexUnicodeTaintLen;
assert.taintEqual(resultString, [{ 'begin': taintStart, 'end': taintEnd },
                                 { 'begin': taintStart2, 'end': taintEnd2 }]);
// Test UTF8
resultString = buf08.toString('utf8');
assert.strictEqual(resultString.isTainted(), true);
taintStart = 0;
taintEnd = strUtf8TaintLen;
taintStart2 = taintEnd + strUtf8Len;
taintEnd2 = taintStart2 + strUtf8TaintLen;
assert.taintEqual(resultString, [{ 'begin': taintStart, 'end': taintEnd },
                                 { 'begin': taintStart2, 'end': taintEnd2 }]);
