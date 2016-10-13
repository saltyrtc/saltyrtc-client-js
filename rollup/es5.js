import config from './es2015.js';
import babel from 'rollup-plugin-babel';

config.entry = 'saltyrtc/main.es5.ts';
config.dest = 'dist/saltyrtc-client.es5.js';
config.plugins.push(
    babel({
        babelrc: false,
        exclude: 'node_modules/**',
        presets: ['es2015-rollup'],
        plugins: ['external-helpers']
    })
)

export default config;
