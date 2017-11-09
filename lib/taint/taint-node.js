'use strict';

module.exports.instrumentModule = (path, mod) => {
  if (path === 'mongoose') {
    const _mongoose = require('_mongoose');
    _mongoose.instrument(mod);
  }
};
