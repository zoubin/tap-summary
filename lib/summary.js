var ansi = require('ansi-escape')
var noAnsi = require('./no-ansi');
var symbols = require('figures')
var prettyMs = require('pretty-ms')
var LF = '\n'

var summarize = require('./summarize')

module.exports = function (opts) {
  opts = opts || {}
  opts.ansi = typeof opts.ansi !== 'undefined' ? opts.ansi : true
  opts.progress = typeof opts.progress !== 'undefined' ? opts.progress : true
  opts.markdown = typeof opts.markdown !== 'undefined' ? opts.markdown : false

  var format = opts.ansi ? ansi : noAnsi
  var splitter = opts.markdown ? mdSplitter : barSplitter

  var INDENT = opts.markdown ? repeat(' ', 4) : ''
  var LIST = opts.markdown ? '- ' : ''

  var summary = summarize()
  var output = summary.output

  output.push(LF + splitter(' Tests '))

  summary.on('test.start', function (test) {
    Object.defineProperty(test, 'title', { get: getTitle })
  })

  summary.on('test.end', function (test) {
    if (test.fail) {
      output.push(format.cha.red.eraseLine.escape(INDENT + symbols.cross + ' ' + test.title))
    } else {
      output.push(format.cha.green.eraseLine.escape(INDENT + symbols.tick + ' ' + test.title))
    }
  })

  if (opts.progress) {
    summary.on('test.start', function (test) {
      output.push(LF + format.cha.eraseLine.escape(INDENT + '# ' + test.title))
    })

    summary.on('test.pass', function (test) {
      output.push(format.cha.eraseLine.escape(INDENT + '# ' + test.title))
    })

    summary.on('test.fail', function (test) {
      output.push(format.cha.eraseLine.escape(INDENT + '# ' + test.title))
    })
  }

  summary.on('summary', function (sum, fails, comments) {
    output.push(formatSummary(sum))

    if (sum.fail) {
      output.push(formatFail(fails))
    }
    if (sum.comments) {
      output.push(formatComment(comments))
    }
    output.push(LF + LF)
    output.push(null)
  })

  return summary

  function getTitle() {
    return this.name + ' [' +
      'pass: ' + this.pass + ', fail: ' + this.fail +
      (this.duration ? ', duration: ' + prettyMs(this.duration) : '') +
      ']'
  }

  function formatSummary(res) {
    var output = [LF]
    output.push(splitter(' Summary '))
    output.push(format.cyan.escape(LIST + 'duration: ' + prettyMs(res.duration)))
    output.push(format.cyan.escape(LIST + 'assertions: ' + res.assertions))
    if (res.pass) {
      output.push(format.green.escape(LIST + 'pass: ' + res.pass))
    } else {
      output.push(format.cyan.escape(LIST + 'pass: ' + res.pass))
    }
    if (res.fail) {
      output.push(format.red.escape(LIST + 'fail: ' + res.fail))
    } else {
      output.push(format.cyan.escape(LIST + 'fail: ' + res.fail))
    }
    return output.join(LF)
  }

  function formatComment(comments) {
    var output = [LF]
    output.push(splitter(' Comments '))
    output.push(Object.keys(comments).map(function (name) {
      return format.cyan.underline.escape(name) + LF + comments[name].join(LF)
    }).join(LF + LF))
    return output.join(LF)
  }

  function barSplitter(s) {
    var len = s && s.length || 0
    var max = 80
    var left = max - len >> 1
    return format.yellow.escape(
      repeat('-', left) + (s || '') + repeat('-', max - len - left)
    )
  }

  function mdSplitter(s, left) {
    left = arguments.length > 1 ? left : 1
    return format.yellow.escape(
      repeat('#', left) + (s || '') + LF
    )
  }

  function repeat(str, n) {
    if (str.repeat) {
      return str.repeat(n)
    }
    return (new Array(n + 1)).join(str)
  }

  function formatFail(fail) {
    var output = [LF]
    output.push(splitter(' Fails '))
    output.push(
      Object.keys(fail).map(function (name) {
        var res = [format.cyan.underline.escape('# ' + name)]
        fail[name].forEach(function (assertion) {
          res.push(format.red.escape(INDENT + '  ' + symbols.cross + ' ' + assertion.name))
          res.push(prettifyError(assertion))
        })
        return res.join(LF)
      }).join(LF + LF)
    )

    return output.join(LF)
  }

  function prettifyError(assertion) {
    var rawError = assertion.error.raw
    var ret = rawError.split(LF).map(function (s) {
      return INDENT + s
    })
    var stack = assertion.error.stack
    if (stack) {
      stack = stack.split(LF)
      var padding = repeat(' ', ret[ret.length - 1].length)
      ret = ret.concat(stack.map(function (s) {
        return padding + s
      }))
    }
    return format.cyan.escape(ret.join(LF))
  }
}
