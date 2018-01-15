'use strict';

const modules = ['mongodb-core'];

module.exports.instrumentModule = (path, mod) => {
  if (modules.includes(path)) {
    const wrapper = require(`taint/_${path}`);
    wrapper.instrument(mod);
  }
};
