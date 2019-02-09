'use strict';

const log = require('taint/logger');
const modules = ['mongodb-core'];

module.exports.instrumentModule = (path, mod) => {
  if (modules.includes(path)) {
    const wrapper = require(`taint/_${path}`);
    wrapper.instrument(mod);
    log.info(`${path} module detected and instrumented.`);
  }
};
