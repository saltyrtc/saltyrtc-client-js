import config from './es2015.js';
import babel from 'rollup-plugin-babel';

config.entry = 'saltyrtc/main.es5.ts';
config.dest = 'dist/saltyrtc-client.es5.js';
config.plugins.push(
    babel({
        babelrc: false,
        exclude: 'node_modules/**',
        presets: [
            // Use ES2015 but don't transpile modules since Rollup does that
            ['es2015', {modules: false}]
        ],
        plugins: ['external-helpers']
    })
)

export default config;
