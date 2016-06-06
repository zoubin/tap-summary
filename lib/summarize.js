var duplexer = require('duplexer2')
var parser = require('tap-out')
var PassThrough = require('stream').PassThrough

module.exports = function () {
  var tap = parser()
  var output = PassThrough()
  var dup = duplexer(tap, output)
  dup.output = output

  var test
  var duration = 0

  function handleTestEnd() {
    if (test) {
      test.end = new Date()
      test.duration = test.end - test.start
      duration += test.duration
      dup.emit('test.end', test)
    }
  }

  tap.on('test', function (res) {
    handleTestEnd()
    test = {
      name: res.name,
      pass: 0,
      fail: 0,
      start: new Date(),
    }
    dup.emit('test.start', test)
  })

  tap.on('pass', function () {
    ++test.pass
    dup.emit('test.pass', test)
  })

  tap.on('fail', function () {
    ++test.fail
    dup.emit('test.fail', test)
  })

  tap.on('output', function (res) {
    handleTestEnd()

    if (res.fail.length) {
      dup.failed = true
    }

    if (res.plans.length < 1) {
      dup.failed = true
      process.exit(1)
    }

    dup.emit('summary', {
      duration: duration,
      assertions: res.asserts.length,
      pass: res.pass.length,
      fail: res.fail.length,
      comments: res.comments.length,
    }, res.fail.reduce(function (o, assertion) {
      var name = getTest(assertion.test, res.tests).name
      o[name] = o[name] || []
      o[name].push(assertion)
      return o
    }, {}), res.comments.reduce(function (o, assertion) {
      var name = getTest(assertion.test, res.tests).raw
      o[name] = o[name] || []
      o[name].push(assertion.raw)
      return o
    }, {}), res)
  })

  return dup
}

function getTest(n, tests) {
  for (var i = 0, len = tests.length; i < len; ++i) {
    if (~~n === tests[i].number) {
      return tests[i]
    }
  }
  return null
}
