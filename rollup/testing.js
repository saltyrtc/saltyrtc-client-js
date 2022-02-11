import config from './es5.js';

config.input = 'tests/main.ts';
config.output.file = 'tests/testsuite.js';
config.output.sourcemap = true;

export default config;
