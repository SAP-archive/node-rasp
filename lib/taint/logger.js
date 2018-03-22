'use strict';
const escape = '\x1b[';
const grey = `${escape}90m`;
const red = `${escape}31m`;
const cyan = `${escape}36m`;
const prefix = `${grey}[ ${cyan}TaintNode ${grey}]`;

exports.info = (info) => {
  console.info(prefix, info);
};

exports.detected = (attack, part) => {
  let info = `${attack} with`;
  if (typeof part === 'object' && part.length) {
    part.forEach((p, i) => {
      info += ` ${red}${p}${grey} ${i + 1 < part.length ? 'and' : ''}`;
    });
  } else {
    info += ` ${red}${part}`;
  }
  info += ` ${grey}detected`;
  console.info(prefix, info);
};
