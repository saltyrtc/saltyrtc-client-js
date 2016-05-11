module.exports = function(config) {
  config.set({
    frameworks: ['jasmine'],
    browsers: ['Chrome', 'Firefox'],
    files: [
      'dist/tests.js'
    ]
  })
}
