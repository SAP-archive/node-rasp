'use strict';
(() => {
  // Load plain database driver
  const mongoose = require('mongoose');

  // Instrument database driver parameters
  const find = mongoose.model.prototype.find;
  mongoose.model.prototype.find = () => {
    arguments[0] = sanitizeNoSQLParameter(arguments[0]);
    find.apply(this, arguments);
  };

  function sanitizeNoSQLParameter(param) {
    if (param !== undefined && typeof param === 'object') {
      for (const key in param) {
        param[key] = sanitizeNoSQLParameter(param[key]);
        if (key[0] === '$' && key.isTainted()) {
          // Assumption: when a key is tainted the entire object is tainted
          return JSON.stringify(param);
        }
      }
    }
    return param;
  }

})();
