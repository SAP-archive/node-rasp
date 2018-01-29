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
  console.info(prefix, `${attack} with ${red}${part} ${grey}detected`);
};
