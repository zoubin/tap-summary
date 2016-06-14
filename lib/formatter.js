var format = require('ansi-escape')
var symbols = require('figures')
var prettyMs = require('pretty-ms')
var LF = '\n'

module.exports = Formatter

function Formatter(opts) {
  opts = opts || {}
  this.needDuration = opts.duration !== false
  this.needAnsi = opts.ansi !== false
  this.needProgress = this.needAnsi && opts.progress !== false
}

Formatter.prototype.init = function (reporter) {
  var self = this

  reporter.push(LF + this.splitter(' Tests '))
  reporter.on('test.start', function (test) {
    Object.defineProperty(test, 'title', { get: getTitle })
  })
  function getTitle() {
    return this.name + ' [' +
      'pass: ' + this.pass + ', fail: ' + this.fail +
      (self.needDuration ? ', duration: ' + prettyMs(this.duration || 0) : '') +
      ']'
  }

  if (this.needProgress) {
    reporter.on('test.start', function (test) {
      this.push(LF + self.format('# ' + test.title, 'cha.eraseLine'))
    })
    reporter.on('test.assert', function (assertion, test) {
      this.push(self.format('# ' + test.title, 'cha.eraseLine'))
    })
  }

  reporter.on('test.end', function (test) {
    this.push(self.test(test))
  })
  reporter.on('summary', function (stats, fails, comments) {
    this.push(self.summary(stats))
    if (fails) {
      this.push(self.fail(fails))
    }
    if (comments) {
      this.push(self.comment(comments))
    }
  })
  return reporter
}

Formatter.prototype.summary = function (summary) {
  var output = [LF]
  output.push(this.splitter(' Summary '))

  if (this.needDuration) {
    output.push(this.format(
      'duration: ' + prettyMs(summary.duration),
      'cyan'
    ))
  }
  output.push(this.format(
    'planned: ' + summary.planned,
    summary.planned instanceof Error ? 'red' : 'cyan'
  ))
  output.push(this.format(
    'assertions: ' + summary.assertions,
    'cyan'
  ))
  output.push(this.format(
    'pass: ' + summary.pass,
    summary.pass ? 'green' : 'cyan'
  ))
  output.push(this.format(
    'fail: ' + summary.fail,
    summary.fail ? 'red' : 'cyan'
  ))

  return output.join(LF)
}

Formatter.prototype.comment = function (comments) {
  var output = [LF]
  output.push(this.splitter(' Comments '))
  output.push(Object.keys(comments).map(function (name) {
    return this.format('# ' + name, 'cyan.underline') + LF + comments[name].join(LF)
  }, this).join(LF + LF))
  return output.join(LF)
}

Formatter.prototype.fail = function (fail) {
  var output = [LF]
  output.push(this.splitter(' Fails '))
  output.push(
    Object.keys(fail).map(function (name) {
      var res = [this.format('# ' + name, 'cyan.underline')]
      fail[name].forEach(function (assertion) {
        res.push(this.format('  ' + symbols.cross + ' ' + assertion.name, 'red'))
        res.push(this.prettifyError(assertion))
      }, this)
      return res.join(LF)
    }, this).join(LF + LF)
  )
  return output.join(LF)
}

Formatter.prototype.prettifyError = function (assertion) {
  var rawError = assertion.error.raw
  var ret = rawError.split(LF)
  var stack = assertion.error.stack
  if (stack) {
    stack = stack.split(LF)
    var padding = repeat(' ', ret[ret.length - 1].length)
    ret = ret.concat(stack.map(function (s) {
      return padding + s
    }))
  }
  return this.format(ret.join(LF), 'cyan')
}

Formatter.prototype.splitter = function (s) {
  var len = s.length
  var max = 80
  var left = max - len >> 1
  return this.format(
    repeat('-', left) + (s || '') + repeat('-', max - len - left) + LF,
    'yellow'
  )
}

Formatter.prototype.test = function (test) {
  if (this.needProgress) {
    if (test.fail) {
      return this.format(symbols.cross + ' ' + test.title, 'cha.red.eraseLine')
    }
    return this.format(symbols.tick + ' ' + test.title, 'cha.green.eraseLine')
  }

  if (test.fail) {
    return LF + this.format(symbols.cross + ' ' + test.title, 'cha.red')
  }
  return LF + this.format(symbols.tick + ' ' + test.title, 'cha.green')
}

Formatter.prototype.format = function (str, formats) {
  if (!this.needAnsi) {
    return str
  }
  // format.cyan.underline.escape(str)
  return formats.split('.').reduce(function (f, c) {
    f = f[c]
    return f
  }, format).escape(str)
}

function splitter(s) {
  var len = s.length
  var max = 80
  var left = max - len >> 1
  return repeat('-', left) + (s || '') + repeat('-', max - len - left) + LF
}

function repeat(str, n) {
  if (str.repeat) {
    return str.repeat(n)
  }
  return (new Array(n + 1)).join(str)
}

