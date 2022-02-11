import config from './es5.js';

config.input = 'tests/performance.ts';
config.output.file = 'tests/performance.js';
config.output.sourcemap = true;

export default config;
