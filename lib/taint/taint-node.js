'use strict';

const modules = ['mongodb-core'];

module.exports.instrumentModule = (path, mod) => {
  if (modules.includes(path)) {
    const wrapper = require(`taint/_${path}`);
    wrapper.instrument(mod);
    console.info('\x1b[90m', '[',
                 '\x1b[36m', 'TaintNode',
                 '\x1b[90m', ']',
                 '\x1b[90m', `${path} module detected and instrumented.`);
  }
};
