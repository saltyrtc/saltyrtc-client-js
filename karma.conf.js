module.exports = function(config) {

  var configuration = {
    frameworks: ['jasmine'],
    files: [
      'node_modules/tweetnacl/nacl-fast.min.js',
      'node_modules/msgpack-lite/dist/msgpack.min.js',
      'tests/testsuite.js'
    ],
    customLaunchers: {
      Chrome_travis_ci: {
        base: 'Chrome',
        flags: ['--no-sandbox']
      },
      Firefox_travis_ci: {
        base: 'Firefox',
        profile: '/home/travis/.mozilla/firefox/saltyrtc',
      }
    }
  };

  if (process.env.TRAVIS) {
    configuration.browsers = ['Chrome_travis_ci', 'Firefox_travis_ci'];
  } else {
    configuration.browsers = ['Chrome', 'Firefox'];
  }

  config.set(configuration);

}
