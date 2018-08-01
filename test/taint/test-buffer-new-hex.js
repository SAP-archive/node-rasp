'use strict';
require('../common');
const assert = require('assert');

// ASCII
const strAscii = 'This string is not tainted!';
const strAsciiTaint = 'This is a tainted string!'.setTaint('baz');

const strAsciiLen = strAscii.length;
const strAsciiTaintLen = strAsciiTaint.length;

// HEX
const strHex = Buffer.from(strAscii, 'ascii').toString('hex');
const strHexTaint = Buffer.from(strAsciiTaint, 'ascii').toString('hex')
                                                       .setTaint('abc');
const strHexLen = Buffer.from(strAscii, 'ascii').toString('hex').length;
const strHexTaintLen = Buffer.from(strAsciiTaint, 'ascii')
                                                .toString('hex').length;
const bufHexLen = Buffer.from(strHex, 'hex').length;
const bufHexTaintLen = Buffer.from(strHexTaint, 'hex').length;

let resultString;
let taintEnd;
let taintEnd2;
let taintStart;
let taintStart2;

// ### ONE STRING ###

// Hex string in buffer is tainted.
const buf01 = new Buffer(strHexTaint, 'hex');
assert.taintEqual(buf01, [{ 'begin': 0, 'end': bufHexTaintLen }]);
// Test HEX
resultString = buf01.toString('hex');
assert.strictEqual(resultString.isTainted(), true);
assert.taintEqual(resultString, [{ 'begin': 0, 'end': strHexTaintLen }]);
// Test ASCII
resultString = buf01.toString('ascii');
assert.strictEqual(resultString.isTainted(), true);
assert.taintEqual(resultString, [{ 'begin': 0, 'end': strAsciiTaintLen }]);

// Hex string in buffer is not tainted.
const buf02 = new Buffer(strHex, 'hex');
assert.taintEqual(buf02, []);
// Test HEX
resultString = buf02.toString('hex');
assert.strictEqual(resultString.isTainted(), false);
assert.taintEqual(resultString, []);
// Test ASCII
resultString = buf02.toString('ascii');
assert.strictEqual(resultString.isTainted(), false);
assert.taintEqual(resultString, []);

// ### Concatenation of strings ###

// Concatenated hex string: One tainted string
const buf03 = new Buffer(strHex + strHexTaint + strHex, 'hex');
taintStart = bufHexLen;
taintEnd = taintStart + bufHexTaintLen;
assert.taintEqual(buf03, [{ 'begin': taintStart, 'end': taintEnd }]);
// Test HEX
resultString = buf03.toString('hex');
assert.strictEqual(resultString.isTainted(), true);
taintStart = strHexLen;
taintEnd = taintStart + strHexTaintLen;
assert.taintEqual(resultString, [{ 'begin': taintStart, 'end': taintEnd }]);
// Test ASCII
resultString = buf03.toString('ascii');
assert.strictEqual(resultString.isTainted(), true);
taintStart = strAsciiLen;
taintEnd = taintStart + strAsciiTaintLen;
assert.taintEqual(resultString, [{ 'begin': taintStart, 'end': taintEnd }]);

// Concatenated hex string: Two same tainted string
const buf04 = new Buffer(strHex + strHexTaint + strHexTaint +
                                                strHex, 'hex');
taintStart = bufHexLen;
taintEnd = taintStart + bufHexTaintLen * 2;
assert.taintEqual(buf04, [{ 'begin': taintStart, 'end': taintEnd }]);
// Test HEX
resultString = buf04.toString('hex');
assert.strictEqual(resultString.isTainted(), true);
taintStart = strHexLen;
taintEnd = taintStart + strHexTaintLen * 2;
assert.taintEqual(resultString, [{ 'begin': taintStart, 'end': taintEnd }]);
// Test ASCII
resultString = buf04.toString('ascii');
assert.strictEqual(resultString.isTainted(), true);
taintStart = strAsciiLen;
taintEnd = taintStart + strAsciiTaintLen * 2;
assert.taintEqual(resultString, [{ 'begin': taintStart, 'end': taintEnd }]);

// Concatenated hex string: Two different tainted string
const buf05 = new Buffer(strHex + strHexTaint.setTaint('different') +
                                  strHexTaint + strHex, 'hex');
taintStart = bufHexLen;
taintEnd = taintStart + bufHexTaintLen;
taintStart2 = taintEnd;
taintEnd2 = taintStart2 + bufHexTaintLen;
assert.taintEqual(buf05, [{ 'begin': taintStart, 'end': taintEnd },
                          { 'begin': taintStart2, 'end': taintEnd2 }]);
// Test HEX
resultString = buf05.toString('hex');
assert.strictEqual(resultString.isTainted(), true);
taintStart = strHexLen;
taintEnd = taintStart + strHexTaintLen;
taintStart2 = taintEnd;
taintEnd2 = taintStart2 + strHexTaintLen;
assert.taintEqual(resultString, [{ 'begin': taintStart, 'end': taintEnd },
                                 { 'begin': taintStart2, 'end': taintEnd2 }]);
// Test ASCII
resultString = buf05.toString('ascii');
assert.strictEqual(resultString.isTainted(), true);
taintStart = strAsciiLen;
taintEnd = taintStart + strAsciiTaintLen;
taintStart2 = taintEnd;
taintEnd2 = taintStart2 + strAsciiTaintLen;
assert.taintEqual(resultString, [{ 'begin': taintStart, 'end': taintEnd },
                                 { 'begin': taintStart2, 'end': taintEnd2 }]);

// HEX string: Taint at the beginning
const buf06 = new Buffer(strHexTaint + strHex, 'hex');
taintStart = 0;
taintEnd = bufHexTaintLen;
assert.taintEqual(buf06, [{ 'begin': taintStart, 'end': taintEnd }]);
// Test HEX
resultString = buf06.toString('hex');
assert.strictEqual(resultString.isTainted(), true);
taintStart = 0;
taintEnd = strHexTaintLen;
assert.taintEqual(resultString, [{ 'begin': taintStart, 'end': taintEnd }]);
// Test ASCII
resultString = buf06.toString('ascii');
assert.strictEqual(resultString.isTainted(), true);
taintStart = 0;
taintEnd = strAsciiTaintLen;
assert.taintEqual(resultString, [{ 'begin': taintStart, 'end': taintEnd }]);

// HEX string: Taint at the end
const buf07 = new Buffer(strHex + strHexTaint, 'hex');
taintStart = bufHexLen;
taintEnd = taintStart + bufHexTaintLen;
assert.taintEqual(buf07, [{ 'begin': taintStart, 'end': taintEnd }]);
// Test HEX
resultString = buf07.toString('hex');
assert.strictEqual(resultString.isTainted(), true);
taintStart = strHexLen;
taintEnd = taintStart + strHexTaintLen;
assert.taintEqual(resultString, [{ 'begin': taintStart, 'end': taintEnd }]);
// Test ASCII
resultString = buf07.toString('ascii');
assert.strictEqual(resultString.isTainted(), true);
taintStart = strAsciiLen;
taintEnd = taintStart + strAsciiTaintLen;
assert.taintEqual(resultString, [{ 'begin': taintStart, 'end': taintEnd }]);

// Hex String at the beginning and the end
const buf08 = new Buffer(strHexTaint + strHex + strHexTaint, 'hex');
taintStart = 0;
taintEnd = bufHexTaintLen;
taintStart2 = taintEnd + bufHexLen;
taintEnd2 = taintStart2 + bufHexTaintLen;
assert.taintEqual(buf08, [{ 'begin': taintStart, 'end': taintEnd },
                          { 'begin': taintStart2, 'end': taintEnd2 }]);
// Test HEX
resultString = buf08.toString('hex');
assert.strictEqual(resultString.isTainted(), true);
taintStart = 0;
taintEnd = strHexTaintLen;
taintStart2 = taintEnd + strHexLen;
taintEnd2 = taintStart2 + strHexTaintLen;
assert.taintEqual(resultString, [{ 'begin': taintStart, 'end': taintEnd },
                                 { 'begin': taintStart2, 'end': taintEnd2 }]);
// Test ASCII
resultString = buf08.toString('ascii');
assert.strictEqual(resultString.isTainted(), true);
taintStart = 0;
taintEnd = strAsciiTaintLen;
taintStart2 = taintEnd + strAsciiLen;
taintEnd2 = taintStart2 + strAsciiTaintLen;
assert.taintEqual(resultString, [{ 'begin': taintStart, 'end': taintEnd },
                                 { 'begin': taintStart2, 'end': taintEnd2 }]);
