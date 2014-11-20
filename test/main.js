// The entry point for unit tests.

var TEST_REGEXP = /_spec\.js$/;

function pathToModule(path) {
  return path.replace(/^\/base\//, '').replace(/\.js$/, '');
}

function onlySpecs(path) {
  return TEST_REGEXP.test(path);
}

function getAllSpecs() {
  return Object.keys(window.__karma__.files)
      .filter(onlySpecs)
      .map(pathToModule);
}

var rjsConfig = REQUIREJS_CONFIG;

  // Karma serves files under `/base`, which is the `basePath` from `karma-conf.js` file.
rjsConfig.baseUrl = '/base';

// Dynamically load all test files.
rjsConfig.deps = getAllSpecs();

// Kickoff Jasmine, once all spec files are loaded.
rjsConfig.callback = window.__karma__.start;

require.config(rjsConfig);