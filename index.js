var reporter = require('./lib/reporter')
var Formatter = require('./lib/formatter')

module.exports = function (opts) {
  return reporter(new Formatter(opts))
}
module.exports.Formatter = Formatter
module.exports.reporter = reporter
module.exports.parser = require('./lib/parser')

