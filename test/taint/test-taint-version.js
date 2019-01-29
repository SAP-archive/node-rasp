'use strict';
require('../common');
const assert = require('assert');

assert(process.taintVersion.match(/v[0-9]+\.[0-9]+\.[0-9]+/g));
