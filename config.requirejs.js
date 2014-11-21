var isNode = typeof exports != 'undefined';
var isDist = isNode;

var bower, npm;

if(isDist){
  bower = '../deps';
  npm = '../deps';
}
else {
  bower = '../../bower_components';
  npm = '../../node_modules';
}


var REQUIREJS_CONFIG = {
  paths: {
    'jquery': bower + '/jquery/jquery',
    'bootstrap': bower + '/bootstrap/dist/js/bootstrap',
    'knockout': bower + '/knockout.js/knockout.debug',
    'ko': bower + '/knockout.js/knockout.debug',
    'text': bower + '/requirejs-text/text',
    'durandal': bower + '/durandal/js',
    'plugins': bower + '/durandal/js/plugins',
    'transitions': bower + '/durandal/js/transitions',
    'durandal.punches': bower + '/durandal.punches/build/output/durandal.punches',
    'assert': npm + '/rtts-assert/dist/amd/assert',
  },
  map: {
    '*': {
      'di': npm + '/di/dist/amd/index',
      'durandal.forge': bower + '/durandal.forge/dist/amd/index',
    }
  },
  shim: {
    'bootstrap': {
      deps: ['jquery'],
    },
  },
  deps: ['main'],
  baseUrl: (isDist ? '' : '/build/') + 'app',
};

if(isNode){
  module.exports = REQUIREJS_CONFIG;
}
