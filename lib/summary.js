var format = require('ansi-escape')
var symbols = require('figures')
var prettyMs = require('pretty-ms')
var LF = '\n'

var summarize = require('./summarize')

module.exports = function () {
  var summary = summarize()
  var output = summary.output

  output.push(LF + splitter(' Tests '))

  summary.on('test.start', function (test) {
    Object.defineProperty(test, 'title', { get: getTitle })
    output.push(LF + format.cha.eraseLine.escape('# ' + test.title))
  })

  summary.on('test.end', function (test) {
    if (test.fail) {
      output.push(format.cha.red.eraseLine.escape(symbols.cross + ' ' + test.title))
    } else {
      output.push(format.cha.green.eraseLine.escape(symbols.tick + ' ' + test.title))
    }
  })

  summary.on('test.pass', function (test) {
    output.push(format.cha.eraseLine.escape('# ' + test.title))
  })

  summary.on('test.fail', function (test) {
    output.push(format.cha.eraseLine.escape('# ' + test.title))
  })

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
}

function getTitle() {
  return this.name + ' [' +
    'pass: ' + this.pass + ', fail: ' + this.fail +
    (this.duration ? ', duration: ' + prettyMs(this.duration) : '') +
    ']'
}

function formatSummary(res) {
  var output = [LF]
  output.push(splitter(' Summary '))
  output.push(format.cyan.escape('duration: ' + prettyMs(res.duration)))
  output.push(format.cyan.escape('assertions: ' + res.assertions))
  if (res.pass) {
    output.push(format.green.escape('pass: ' + res.pass))
  } else {
    output.push(format.cyan.escape('pass: ' + res.pass))
  }
  if (res.fail) {
    output.push(format.red.escape('fail: ' + res.fail))
  } else {
    output.push(format.cyan.escape('fail: ' + res.fail))
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

function splitter(s) {
  var len = s && s.length || 0
  var max = 80
  var left = max - len >> 1
  return format.yellow.escape(
    repeat('-', left) + (s || '') + repeat('-', max - len - left)
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
        res.push(format.red.escape('  ' + symbols.cross + ' ' + assertion.name))
        res.push(prettifyError(assertion))
      })
      return res.join(LF)
    }).join(LF + LF)
  )

  return output.join(LF)
}

function prettifyError(assertion) {
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
  return format.cyan.escape(ret.join(LF))
}

