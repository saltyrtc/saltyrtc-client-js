module.exports = function(config) {

    const configuration = {
        frameworks: ['jasmine'],
        files: [
            'node_modules/tweetnacl/nacl-fast.min.js',
            'node_modules/msgpack-lite/dist/msgpack.min.js',
            'tests/testsuite.js'
        ],
        customLaunchers: {
            Firefox_circle_ci: {
                base: 'Firefox',
                profile: '/home/ci/.mozilla/firefox/saltyrtc',
            }
        }
    };

    if (process.env.CIRCLECI) {
        configuration.browsers = ['ChromiumHeadless', 'Firefox_circle_ci'];
    } else {
        configuration.browsers = ['Chromium', 'Firefox'];
    }

    config.set(configuration);

};
