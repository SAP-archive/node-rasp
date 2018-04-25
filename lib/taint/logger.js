'use strict';
const escape = '\x1b[';
const grey = `${escape}90m`;
const red = `${escape}31m`;
const cyan = `${escape}36m`;
const prefix = `${grey}[ ${cyan}TaintNode ${grey}]`;

function getTrace() {
  const stack = new Error().stack;
  const lines = stack.split('\n');
  lines.splice(0, 4);
  return lines.join('\n');
}

exports.info = (info) => {
  console.info(prefix, info);
};

exports.detected = (attack) => {
  const info = `${red}${attack} ${grey}detected \n${getTrace()}`;
  console.info(prefix, info);
};
