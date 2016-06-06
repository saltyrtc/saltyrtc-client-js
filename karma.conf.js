module.exports = function(config) {

  var configuration = {
    frameworks: ['jasmine'],
    files: [
      'vendor/nacl-fast.min.js',
      'vendor/msgpack.min.js',
      'dist/tests.js'
    ],
    customLaunchers: {
      Chrome_travis_ci: {
        base: 'Chrome',
        flags: ['--no-sandbox']
      },
      Firefox_travis_ci: {
        base: 'Firefox',
        profile: '~/.mozilla/firefox/saltyrtc',
      }
    }
  };

  if (process.env.TRAVIS) {
    //configuration.browsers = ['Chrome_travis_ci', 'Firefox_travis_ci'];
    configuration.browsers = ['Chrome_travis_ci'];
  } else {
    configuration.browsers = ['Chrome', 'Firefox'];
  }

  config.set(configuration);

}
