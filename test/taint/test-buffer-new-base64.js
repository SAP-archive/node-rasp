'use strict';
require('../common');
const assert = require('assert');

// ASCII
const strAscii = 'This string is not tainted!';
const strAsciiTaint = 'This is a tainted string!'.setTaint('baz');

const strAsciiLen = strAscii.length;
const strAsciiTaintLen = strAsciiTaint.length;

// BASE64
const strBase64 = Buffer.from(strAscii, 'ascii').toString('base64');
const strBase64Taint = Buffer.from(strAsciiTaint, 'ascii').toString('base64')
                                                          .setTaint('abc');

const strBase64Len = Buffer.from(strAscii, 'ascii').toString('base64')
                                                                   .length;
const strBase64TaintLen = Buffer.from(strAsciiTaint, 'ascii')
                                .toString('base64').setTaint('abc').length;

const bufBase64Len = Buffer.from(strBase64, 'base64').length;
const bufBase64TaintLen = Buffer.from(strBase64Taint, 'base64').length;

let resultString;
let taintEnd;
let taintEnd2;
let taintStart;
let taintStart2;
let helpString;
let helpStringEncoded;

// ### ONE STRING ###

// Base64 string in buffer is tainted.
const buf01 = new Buffer(strBase64Taint, 'base64');
assert.taintEqual(buf01, [{ 'begin': 0, 'end': bufBase64TaintLen }]);
// Test BASE64
resultString = buf01.toString('base64');
// assert.strictEqual(resultString.isTainted(), true);
// assert.taintEqual(resultString, [{'begin': 0, 'end': strBase64TaintLen}]);
// Test ASCII
resultString = buf01.toString('ascii');
assert.strictEqual(resultString.isTainted(), true);
assert.taintEqual(resultString, [{ 'begin': 0, 'end': strAsciiTaintLen }]);

// Base64 string in buffer is not tainted.
const buf02 = new Buffer(strBase64, 'base64');
assert.taintEqual(buf02, []);
// Test BASE64
resultString = buf02.toString('base64');
assert.strictEqual(resultString.isTainted(), false);
assert.taintEqual(resultString, []);
// Test ASCII
resultString = buf02.toString('ascii');
assert.strictEqual(resultString.isTainted(), false);
assert.taintEqual(resultString, []);


// ### CONCATENATION ###

// Concatenated base64 string: One tainted string
helpString = strAscii + strAsciiTaint + strAscii;
helpStringEncoded = Buffer.from(helpString, 'ascii').toString('base64');

const buf03 = new Buffer(helpStringEncoded, 'base64');
taintStart = bufBase64Len;
taintEnd = taintStart + bufBase64TaintLen;
// assert.taintEqual(buf03, [{'begin': taintStart, 'end': taintEnd }]);
// Test BASE64
resultString = buf03.toString('base64');
// assert.strictEqual(resultString.isTainted(), true);
taintStart = strBase64Len;
taintEnd = taintStart + strBase64TaintLen;
// assert.taintEqual(resultString, [{'begin': taintStart, 'end': taintEnd}]);
// Test ASCII
resultString = buf03.toString('ascii');
// assert.strictEqual(resultString.isTainted(), true);
taintStart = strAsciiLen;
taintEnd = taintStart + strAsciiTaintLen;
// assert.taintEqual(resultString, [{'begin': taintStart, 'end': taintEnd}]);

//
// TODO: continue here
//
// Test 39: Concatenated base64 string: Two same tainted string
helpString = strAscii + strAsciiTaint + strAsciiTaint + strAscii;
helpStringEncoded = Buffer.from(helpString, 'ascii').toString('base64');
const buf39 = new Buffer(helpStringEncoded, 'base64');
taintStart = bufBase64Len;
taintEnd = taintStart + bufBase64TaintLen * 2;
// TODO: fails
// assert.taintEqual(buf39, [{'begin': taintStart, 'end': taintEnd }]);
// Test BASE64
resultString = buf39.toString('base64');
// TODO: fails
// assert.strictEqual(resultString.isTainted(), true);
taintStart = strBase64Len;
taintEnd = taintStart + strBase64TaintLen * 2;
// TODO: fails
// assert.taintEqual(resultString, [{'begin': taintStart, 'end': taintEnd}]);
// Test ASCII
resultString = buf39.toString('ascii');
// TODO: fails
// assert.strictEqual(resultString.isTainted(), true);
taintStart = strAsciiLen;
taintEnd = taintStart + strAsciiTaintLen * 2;
// TODO: fails
// assert.taintEqual(resultString, [{'begin': taintStart, 'end': taintEnd}]);

// Test 40: Concatenated base64 string: Two different tainted string
helpString = strAscii + strAsciiTaint + strAsciiTaint.setTaint('different');
helpString = helpString + strAscii;
helpStringEncoded = Buffer.from(helpString, 'ascii').toString('base64');
const buf40 = new Buffer(helpStringEncoded, 'base64');
taintStart = bufBase64Len;
taintEnd = taintStart + bufBase64TaintLen;
taintStart2 = taintEnd;
taintEnd2 = taintStart2 + bufBase64TaintLen;
// TODO: fails
// assert.taintEqual(buf40, [{'begin': taintStart, 'end': taintEnd },
//                           {'begin': taintStart2, 'end': taintEnd2 }]);
// Test BASE64
resultString = buf40.toString('base64');
// TODO: fails
// assert.strictEqual(resultString.isTainted(), true);
taintStart = strBase64Len;
taintEnd = taintStart + strBase64TaintLen;
taintStart2 = taintEnd;
taintEnd2 = taintStart2 + strBase64TaintLen;
// TODO: fails
// assert.taintEqual(resultString, [{'begin': taintStart, 'end': taintEnd},
//                                  {'begin': taintStart2, 'end': taintEnd2 }]);
// Test ASCII
resultString = buf40.toString('ascii');
// TODO: fail
// sassert.strictEqual(resultString.isTainted(), true);
taintStart = strAsciiLen;
taintEnd = taintStart + strAsciiTaintLen;
taintStart2 = taintEnd;
taintEnd2 = taintStart2 + strAsciiTaintLen;
// TODO: fails
// assert.taintEqual(resultString, [{'begin': taintStart, 'end': taintEnd},
//                                 {'begin': taintStart2, 'end': taintEnd2 }]);

// Test 41: Base64 string: Taint at the beginning
helpString = strAsciiTaint + strAscii;
helpStringEncoded = Buffer.from(helpString, 'ascii').toString('base64');
const buf41 = new Buffer(helpStringEncoded, 'base64');
taintStart = 0;
taintEnd = bufBase64TaintLen;
// TODO: fails
// assert.taintEqual(buf41, [{'begin': taintStart, 'end': taintEnd }]);
// Test BASE64
resultString = buf41.toString('base64');
// TODO: fails
// assert.strictEqual(resultString.isTainted(), true);
taintStart = 0;
taintEnd = strBase64TaintLen;
// TODO: fails
// assert.taintEqual(resultString, [{'begin': taintStart, 'end': taintEnd}]);
// Test ASCII
resultString = buf41.toString('ascii');
// TODO: fails
// assert.strictEqual(resultString.isTainted(), true);
taintStart = 0;
taintEnd = strAsciiTaintLen;
// TODO: fails
// assert.taintEqual(resultString, [{'begin': taintStart, 'end': taintEnd}]);

// Test 42: BASE64 string: Taint at the end
helpString = strAscii + strAsciiTaint;
helpStringEncoded = Buffer.from(helpString, 'ascii').toString('base64');
const buf42 = new Buffer(helpStringEncoded, 'base64');
taintStart = bufBase64Len;
taintEnd = taintStart + bufBase64TaintLen;
// TODO: fails
// assert.taintEqual(buf42, [{'begin': taintStart, 'end': taintEnd }]);
// Test BASE64
resultString = buf42.toString('base64');
// TODO: fails
// assert.strictEqual(resultString.isTainted(), true);
taintStart = strBase64Len;
taintEnd = taintStart + strBase64TaintLen;
// TODO: fails
// assert.taintEqual(resultString, [{'begin': taintStart, 'end': taintEnd}]);
// Test ASCII
resultString = buf42.toString('ascii');
// TODO: fails
// assert.strictEqual(resultString.isTainted(), true);
taintStart = strAsciiLen;
taintEnd = taintStart + strAsciiTaintLen;
// TODO: fails
// assert.taintEqual(resultString, [{'begin': taintStart, 'end': taintEnd}]);

// Test 43: Base64 String at the beginning and the end
helpString = strAsciiTaint + strAscii + strAsciiTaint;
helpStringEncoded = Buffer.from(helpString, 'ascii').toString('base64');
const buf43 = new Buffer(helpStringEncoded, 'base64');
taintStart = 0;
taintEnd = bufBase64TaintLen;
taintStart2 = taintEnd + bufBase64Len;
taintEnd2 = taintStart2 + bufBase64TaintLen;
// TODO: fails
// assert.taintEqual(buf43, [{'begin': taintStart, 'end': taintEnd },
//                           {'begin': taintStart2, 'end': taintEnd2 }]);
// Test BASE64
resultString = buf43.toString('base64');
// TODO: fails
// assert.strictEqual(resultString.isTainted(), true);
taintStart = 0;
taintEnd = strBase64TaintLen;
taintStart2 = taintEnd + strBase64Len;
taintEnd2 = taintStart2 + strBase64TaintLen;
// TODO: fails
// assert.taintEqual(resultString, [{'begin': taintStart, 'end': taintEnd},
//                                  {'begin': taintStart2, 'end': taintEnd2}]);
// Test ASCII
resultString = buf43.toString('ascii');
// TODO: fails
// assert.strictEqual(resultString.isTainted(), true);
taintStart = 0;
taintEnd = strAsciiTaintLen;
taintStart2 = taintEnd + strAsciiLen;
taintEnd2 = taintStart2 + strAsciiTaintLen;
// TODO: fails
// assert.taintEqual(resultString, [{'begin': taintStart, 'end': taintEnd},
//                                {'begin': taintStart2, 'end': taintEnd2 }]);
assert.strictEqual(taintEnd2, taintEnd2);
