'use strict';
const Buffer = require('buffer');
function removeAllTaintedString(path, toRemove) {
  var taint = path.getTaint();
  var i;
  for (i = 0; i < taint.length; i++) {
    var tainted = path.substring(taint[i].begin, taint[i].end);
    while (tainted.includes(toRemove))
      tainted = tainted.replace(toRemove, '');
    path = path.substring(0, taint[i].begin) + tainted +
           path.substring(taint[i].end);
  }
  return path;
}

function removeAllTaintedBuffer(path, toRemove) {
  var i;
  for (i = 0; i < path.taint.length; i++) {
    //indexOf, substring is slice
    //concatenating returns a string
    var tainted = path.slice(path.taint[i].begin, path.taint[i].end);
    while (tainted.includes(toRemove)) {
      var array = [];
      array.push(tainted.slice(0, tainted.indexOf(toRemove)));
      array.push(tainted.slice(tainted.indexOf(toRemove) +
        toRemove.length));
      tainted = Buffer.concat(array);
    }
    var arr = [];
    arr.push(path.slice(0, path.taint[i].begin));
    arr.push(tainted);
    arr.push(path.slice(path.taint[i].end));
    path = Buffer.concat(arr);
  }
  return path;

}

function removePathTraversal(path) {
  console.log(path);

  /*if(path.taint){
    path = path.toString();
    wrong, but easy solution--would mean I take out the else part of the
    next if statement
  } */

  if (path.isTainted && path.isTainted()) {
    console.log(path.getTaint());
    path = removeAllTaintedString(path, '../');
    path = removeAllTaintedString(path, '..\\');
  } else if (path.taint) {
    path = removeAllTaintedBuffer(path, '../');
    path = removeAllTaintedBuffer(path, '..\\');
  }
  return path;
}

function removePathTraversalStat(path) {
  if (path.isTainted && path.isTainted()) {
    console.log(path.getTaint());
    path = removeAllTaintedString(path, '..');
  } else if (path.taint) {
    path = removeAllTaintedBuffer(path, '..');
  }
  return path;
}

exports.removePathTraversalStat = removePathTraversalStat;
exports.removePathTraversal = removePathTraversal;
