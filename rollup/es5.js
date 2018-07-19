import config from './es2015.js';
import babel from 'rollup-plugin-babel';

config.output.file = 'dist/saltyrtc-client.es5.js';
config.output.name = 'saltyrtcClient';
config.output.format = 'iife';
config.output.globals = {
    'msgpack-lite': 'msgpack',
    'tweetnacl': 'nacl'
};
config.output.strict = true;
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
);

export default config;
