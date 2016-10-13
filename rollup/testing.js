import config from './es5.js';

config.entry = 'tests/main.ts';
config.dest = 'tests/testsuite.js';
config.sourceMap = true;

export default config;
