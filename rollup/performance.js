import config from './es5.js';

config.entry = 'tests/performance.ts';
config.dest = 'tests/performance.js';
config.sourceMap = true;

export default config;
