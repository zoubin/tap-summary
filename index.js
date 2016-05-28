var showAnsi = false
var showProgress = false

var through = require('through2')
var duplexer = require('duplexer2')
var parser = require('tap-out')
var format = showAnsi ? require('ansi-escape') : require('./no-ansi')
var symbols = require('figures')
var prettyMs = require('pretty-ms')
var LF = '\n'

module.exports = function () {
  var tap = parser()
  var output = through()
  var test

  var duration = 0
  output.push(LF + splitter(' Tests '))
  tap.on('test', function (res) {
    update()
    test = {
      name: res.name,
      pass: 0,
      fail: 0,
      get title() {
        return this.name +
          ' [' +
          'pass: ' + this.pass +
          ', fail: ' + this.fail +
          (test.end ? ', duration: ' + prettyMs(test.duration) : '') +
          ']'
      },
      start: new Date(),
    }
    if (showProgress) {
      output.push(LF + format.cha.eraseLine.escape('# ' + test.title))
    }
  })

  tap.on('pass', function () {
    ++test.pass
    if (showProgress) {
      output.push(format.cha.eraseLine.escape('# ' + test.title))
    }
  })

  tap.on('fail', function () {
    ++test.fail
    if (showProgress) {
      output.push(format.cha.eraseLine.escape('# ' + test.title))
    }
  })

  tap.on('output', function (res) {
    update()
    output.push(formatSummary(res, { duration: duration }))
    if (res.fail.length) {
      dup.failed = true
      output.push(formatFail(res))
    }
    if (res.comments.length) {
      output.push(formatComment(res))
    }
    output.push(LF + LF)
    output.push(null)
  })

  function update() {
    if (test) {
      test.end = new Date()
      test.duration = test.end - test.start
      duration += test.duration
      if (test.fail) {
        output.push(format.cha.red.eraseLine.escape(symbols.cross + ' ' + test.title))
      } else {
        output.push(format.cha.green.eraseLine.escape(symbols.tick + ' ' + test.title))
      }
    }
  }

  var dup = duplexer(tap, output)
  return dup
}

function formatSummary(res, extra) {
  var output = [LF]
  output.push(splitter(' Summary '))
  output.push(format.cyan.escape('duration: ' + prettyMs(extra.duration)))
  output.push(format.cyan.escape('assertions: ' + res.asserts.length))
  if (res.pass.length) {
    output.push(format.green.escape('pass: ' + res.pass.length))
  } else {
    output.push(format.cyan.escape('pass: ' + res.pass.length))
  }
  if (res.fail.length) {
    output.push(format.red.escape('fail: ' + res.fail.length))
  } else {
    output.push(format.cyan.escape('fail: ' + res.fail.length))
  }
  return output.join(LF)
}

function formatComment(res) {
  var comments = res.comments.reduce(function (o, c) {
    var name = getTest(c.test, res.tests).raw
    o[name] = o[name] || []
    o[name].push(c.raw)
    return o
  }, {})
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

function getTest(n, tests) {
  for (var i = 0, len = tests.length; i < len; ++i) {
    if (~~n === tests[i].number) {
      return tests[i]
    }
  }
  return null
}

function formatFail(res) {
  var fail = res.fail.reduce(function (o, c) {
    var name = getTest(c.test, res.tests).name
    o[name] = o[name] || [format.cyan.underline.escape('# ' + name)]
    o[name].push(format.red.escape('  ' + symbols.cross + ' ' + c.name))
    o[name].push(prettifyError(c))
    return o
  }, {})

  var output = [LF]
  output.push(splitter(' Fails '))
  output.push(
    Object.keys(fail).map(function (name) {
      return fail[name].join(LF)
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
