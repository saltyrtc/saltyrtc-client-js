module.exports = function(config) {

  var configuration = {
    frameworks: ['jasmine'],
    files: [
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
    configuration.browsers = ['Firefox'];
  } else {
    configuration.browsers = ['Chrome', 'Firefox'];
  }

  config.set(configuration);

}
