var reporter = require('./reporter')
var symbols = require('figures')
var prettyMs = require('pretty-ms')
var LF = '\n'

module.exports = function (opts) {
  return reporter(new Formatter(opts))
}
module.exports.Formatter = Formatter

function Formatter(opts) {
  this.needDuration = !(opts && opts.duration === false)
}

Formatter.prototype.summary = function (summary) {
  var output = [LF]
  output.push('# Summary')
  if (this.needDuration) {
    output.push('- duration: ' + prettyMs(summary.duration))
  }
  output.push('- planned: ' + summary.planned)
  output.push('- assertions: ' + summary.assertions)
  output.push('- pass: ' + summary.pass)
  output.push('- fail: ' + summary.fail)
  return output.join(LF)
}

Formatter.prototype.comment = function (comments) {
  var output = [LF]
  output.push('# Comments')
  output.push('```')
  output.push(Object.keys(comments).map(function (name) {
    return '# ' + name + LF + comments[name].join(LF)
  }).join(LF + LF))
  output.push('```')
  return output.join(LF)
}

Formatter.prototype.fail = function (fail) {
  var output = [LF]
  output.push(('# Fails'))
  output.push('```')
  output.push(Object.keys(fail).map(function (name) {
    var res = ['# ' + name]
    fail[name].forEach(function (assertion) {
      res.push('  ' + symbols.cross + ' ' + assertion.name)
      res.push(this.prettifyError(assertion))
    }, this)
    return res.join(LF)
  }, this).join(LF + LF))

  output.push('```')
  return output.join(LF)
}

Formatter.prototype.prettifyError = function (assertion) {
  return assertion.error.raw
}

Formatter.prototype.test = function (test) {
  if (!test) {
    return '# Tests'
  }
  var title = test.name + ' [' +
    'pass: ' + test.pass + ', fail: ' + test.fail +
    (this.needDuration ? ', duration: ' + prettyMs(test.duration) : '') +
    ']'
  return LF + '- ' + (test.fail ? symbols.cross : symbols.tick) + ' ' + title
}

