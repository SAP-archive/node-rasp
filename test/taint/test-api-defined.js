'use strict';
require('../common');
const assert = require('assert');

// Check availibility of taint API on string prototpye
assert.strictEqual(typeof ''.isTainted, 'function');
assert.strictEqual(typeof ''.getTaint, 'function');
assert.strictEqual(typeof ''.setTaint, 'function');
assert.strictEqual(typeof ''.removeTaint, 'function');

// Check availability of process.taintVersion
assert(process.taintVersion.match(/v[0-9]+\.[0-9]+\.[0-9]+/g));
