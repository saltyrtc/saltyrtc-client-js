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
      }
    }
  };

  if (process.env.TRAVIS) {
    configuration.browsers = ['Chrome_travis_ci', 'Firefox'];
  } else {
    configuration.browsers = ['Chrome', 'Firefox'];
  }

  config.set(configuration);

}
