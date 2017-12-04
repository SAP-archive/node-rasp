'use strict';

module.exports.instrumentModule = (path, mod) => {
  if (path === 'mongoose') {
    const _mongoose = require('taint/_mongoose');
    _mongoose.instrument(mod);
  }
};
