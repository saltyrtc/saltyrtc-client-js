import config from './rollup.dist.js';

config.entry = 'tests/main.ts';
config.dest = 'dist/tests.js';
config.sourceMap = true;

export default config;
