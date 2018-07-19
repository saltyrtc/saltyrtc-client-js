import config from './es5.js';

config.input = 'tests/main.ts';
config.output.file = 'tests/testsuite.js';
config.output.sourceMap = true;

export default config;
