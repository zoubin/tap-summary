var reporter = require('./lib/reporter')
var Formatter = require('./lib/formatter')

module.exports = function (opts) {
  return new Formatter(opts).init(reporter())
}
module.exports.reporter = reporter
module.exports.Formatter = Formatter
