var through = require('through2')
var duplexer = require('duplexer2')
var parser = require('tap-out')
var format = require('ansi-escape')
var symbols = require('figures')
var LF = '\n'

module.exports = function () {
  var tap = parser()
  var output = through()
  var test

  output.push(LF)

  tap.on('test', function (res) {
    update()

    test = {
      name: res.name,
      pass: 0,
      fail: 0,
    }
    output.push(format.cha.eraseLine.escape('# ' + res.name) + LF)
  })

  tap.on('pass', function (res) {
    test.pass++
    output.push(
      format.cha.eraseLine(2).escape() +
      '  ok ' + format.green.bold.escape(res.number) + ' ' + res.name
    )
  })

  tap.on('fail', function (res) {
    test.fail++
    output.push(
      format.cha.eraseLine(2).escape() +
      '  not ok ' + format.red.bold.escape(res.number) + ' ' + res.name
    )
  })

  tap.on('output', function (res) {
    update()
    output.push(formatSummary(res))
    if (res.fail.length) {
      dup.failed = true
      output.push(formatFail(res))
    }
    if (res.comments.length) {
      output.push(formatComment(res))
    }
    output.push(LF + LF)
  })

  function update() {
    if (test) {
      if (test.fail) {
        output.push(
          format.up.cha.red.escape(
            symbols.cross + ' ' + test.name +
          ' (pass: ' + test.pass + ', fail: ' + test.fail + ')'
          ) +
          format.down.cha.eraseLine.escape()
        )
      } else {
        output.push(
          format.up.cha.green.escape(
            symbols.tick + ' ' + test.name + ' (' + test.pass + ')'
          ) +
          format.down.cha.eraseLine.escape()
        )
      }
    }
  }

  var dup = duplexer(tap, output)
  return dup
}

function formatSummary(res) {
  var output = [LF]
  output.push(splitter(' Summary '))
  output.push(format.yellow.escape('assertions: ' + res.asserts.length))
  if (res.pass.length) {
    output.push(format.green.escape('pass: ' + res.pass.length))
  } else {
    output.push(format.yellow.escape('pass: ' + res.pass.length))
  }
  if (res.fail.length) {
    output.push(format.red.escape('fail: ' + res.fail.length))
  } else {
    output.push(format.yellow.escape('fail: ' + res.fail.length))
  }
  output.push(repeat('=', 80))
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
    return format.yellow.escape(name) + LF + comments[name].join(LF)
  }).join(LF))
  output.push(splitter())
  return output.join(LF)
}

function splitter(s) {
  var len = s && s.length || 0
  var max = 80
  var left = max - len >> 1
  return repeat('=', left) + (s || '') + repeat('=', max - len - left)
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
    o[name] = o[name] || []
    o[name].push(prettifyError(c))
    return o
  }, {})

  var output = [LF]
  output.push(splitter(' Fails '))
  Object.keys(fail).forEach(function (name) {
    output.push(format.red.escape(symbols.cross + ' ' + name))
    output.push(fail[name].join(LF + '    ' + repeat('-', 76) + LF))
  })
  output.push(repeat('=', 80))
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

