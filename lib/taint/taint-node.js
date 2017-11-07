'use strict';

module.exports.maybeInstrument = (mod) => {
  if (mod.id === 'mongoose') {
    const _mongoose = require('_mongoose');
    _mongoose.instrument(mod.exports);
  }
};
