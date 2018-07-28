/*eslint-disable*/
'use strict';
process.env.BABEL_ENV = 'test';
const babelOptions = require('./package.json').babel;
module.exports = function (wallaby) {
  return {
    env: {
      type: 'node',
      runner: 'node'
    },

    testFramework: 'jest',

    files: [
      'jestSetup.js',
      'package.json',
      'src/**/*.js',
      '!src/**/*.spec.js'
    ],

    tests: [
      'src/**/*.spec.js',
    ],

    compilers: {
      '**/*.js': wallaby.compilers.babel(babelOptions)
    },

    setup: function (w) {
      require('babel-polyfill');
      w.testFramework.configure(require('./package.json').jest);
    }
  };
};
